import { Request, Response } from "express";
import { nanoid } from "nanoid";
import { AppDataSource } from "../config/database";
import { Url } from "../entities/Url";
import { User } from "../entities/User";
import { isURL } from "../utils/validation";
import QRCode from "qrcode";

const urlRepository = AppDataSource.getRepository(Url);
const userRepository = AppDataSource.getRepository(User);

/**
 * Creates a new shortened URL with optional custom slug
 * Generates QR code for the shortened URL
 * Associates URL with user if authenticated
 */
export const createShortUrl = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { originalUrl, customSlug } = req.body;
    const userId = req.user?.id;

    // Validate URL
    if (!isURL(originalUrl)) {
      res.status(400).json({
        errors: [
          {
            status: "400",
            title: "Invalid URL",
            detail: "The provided URL is not valid",
          },
        ],
      });
      return;
    }

    // Generate or use custom slug
    let slug = customSlug || nanoid(6);

    // Check if slug already exists
    const existingUrl = await urlRepository.findOne({ where: { slug } });
    if (existingUrl) {
      if (customSlug) {
        res.status(409).json({
          errors: [
            {
              status: "409",
              title: "Conflict",
              detail: "The custom slug is already in use",
            },
          ],
        });
        return;
      }
      // If auto-generated slug exists, try another one
      slug = nanoid(6);
    }

    // Create new URL entity
    const url = new Url();
    url.originalUrl = originalUrl;
    url.slug = slug;
    url.visitCount = 0;

    // Associate with user if authenticated
    if (userId) {
      const user = await userRepository.findOneBy({ id: userId });
      if (user) {
        url.user = user;
      }
    }

    await urlRepository.save(url);

    // Generate QR code - use the frontend URL instead of the backend URL
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const shortUrl = `${frontendUrl}/${slug}`;
    const qrCode = await QRCode.toDataURL(shortUrl);

    res.status(201).json({
      data: {
        type: "urls",
        id: url.id,
        attributes: {
          originalUrl: url.originalUrl,
          shortUrl,
          slug: url.slug,
          qrCode,
          visitCount: url.visitCount,
          createdAt: url.createdAt,
        },
      },
    });
  } catch (error) {
    console.error("Error creating short URL:", error);
    res.status(500).json({
      errors: [
        {
          status: "500",
          title: "Server Error",
          detail: "An error occurred while creating the shortened URL",
        },
      ],
    });
  }
};

/**
 * Redirects from a shortened URL to the original destination URL
 * Increments visit count for analytics
 * @deprecated Use frontend redirection with getRedirectInfo instead
 */
export const redirectToOriginalUrl = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { slug } = req.params;

    const url = await urlRepository.findOne({ where: { slug } });

    if (!url) {
      res.status(404).json({
        errors: [
          {
            status: "404",
            title: "Not Found",
            detail: "The requested URL does not exist",
          },
        ],
      });
      return;
    }

    // Increment visit count
    url.visitCount += 1;
    await urlRepository.save(url);

    // Redirect to original URL
    res.redirect(url.originalUrl);
  } catch (error) {
    console.error("Error redirecting:", error);
    res.status(500).json({
      errors: [
        {
          status: "500",
          title: "Server Error",
          detail: "An error occurred while redirecting to the original URL",
        },
      ],
    });
  }
};

/**
 * Returns redirection information for client-side redirection
 * Provides target URL and updates analytics
 * Preferred over server-side redirection for better tracking and UX
 */
export const getRedirectInfo = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { slug } = req.params;

    if (!slug || slug.trim() === "") {
      res.status(400).json({
        errors: [
          {
            status: "400",
            title: "Bad Request",
            detail: "Invalid or missing slug parameter",
          },
        ],
      });
      return;
    }

    const url = await urlRepository.findOne({ where: { slug } });

    if (!url) {
      res.status(404).json({
        errors: [
          {
            status: "404",
            title: "Not Found",
            detail: "The requested URL does not exist",
          },
        ],
      });
      return;
    }

    // Increment visit count
    url.visitCount += 1;
    await urlRepository.save(url);

    // Return original URL information to frontend
    res.status(200).json({
      originalUrl: url.originalUrl,
      slug: url.slug,
      visitCount: url.visitCount,
    });
  } catch (error) {
    console.error("Error getting redirection info:", error);
    res.status(500).json({
      errors: [
        {
          status: "500",
          title: "Server Error",
          detail: "An error occurred while getting redirection information",
        },
      ],
    });
  }
};

/**
 * Retrieves detailed information about a URL by its ID
 * Includes original URL, short URL, QR code, and visit statistics
 * Restricts access if URL belongs to another user
 */
export const getUrlDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const url = await urlRepository.findOne({
      where: { id },
      relations: { user: true },
    });

    if (!url) {
      res.status(404).json({
        errors: [
          {
            status: "404",
            title: "Not Found",
            detail: "URL not found",
          },
        ],
      });
      return;
    }

    // Check if user is authorized to view this URL
    if (url.user && url.user.id !== req.user?.id) {
      res.status(403).json({
        errors: [
          {
            status: "403",
            title: "Forbidden",
            detail: "You do not have permission to view this URL",
          },
        ],
      });
      return;
    }

    // Use frontend URL instead of backend URL
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const shortUrl = `${frontendUrl}/${url.slug}`;
    const qrCode = await QRCode.toDataURL(shortUrl);

    res.status(200).json({
      data: {
        type: "urls",
        id: url.id,
        attributes: {
          originalUrl: url.originalUrl,
          shortUrl,
          slug: url.slug,
          qrCode,
          visitCount: url.visitCount,
          createdAt: url.createdAt,
          updatedAt: url.updatedAt,
        },
        relationships: url.user
          ? {
              user: {
                data: { type: "users", id: url.user.id },
              },
            }
          : {},
      },
    });
  } catch (error) {
    console.error("Error getting URL details:", error);
    res.status(500).json({
      errors: [
        {
          status: "500",
          title: "Server Error",
          detail: "An error occurred while retrieving URL details",
        },
      ],
    });
  }
};

/**
 * Updates a shortened URL with new options
 * Allows changing the original URL or custom slug
 * Validates permissions and updates QR code
 */
export const updateUrl = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { originalUrl, customSlug } = req.body;

    const url = await urlRepository.findOne({
      where: { id },
      relations: { user: true },
    });

    if (!url) {
      res.status(404).json({
        errors: [
          {
            status: "404",
            title: "Not Found",
            detail: "URL not found",
          },
        ],
      });
      return;
    }

    // Check if user is authorized to update this URL
    if (url.user && url.user.id !== req.user?.id) {
      res.status(403).json({
        errors: [
          {
            status: "403",
            title: "Forbidden",
            detail: "You do not have permission to update this URL",
          },
        ],
      });
      return;
    }

    // Update fields if provided
    if (originalUrl && isURL(originalUrl)) {
      url.originalUrl = originalUrl;
    } else if (originalUrl) {
      res.status(400).json({
        errors: [
          {
            status: "400",
            title: "Invalid URL",
            detail: "The provided URL is not valid",
          },
        ],
      });
      return;
    }

    if (customSlug) {
      // Check if slug is available
      const existingUrl = await urlRepository.findOne({
        where: { slug: customSlug },
      });
      if (existingUrl && existingUrl.id !== id) {
        res.status(409).json({
          errors: [
            {
              status: "409",
              title: "Conflict",
              detail: "The custom slug is already in use",
            },
          ],
        });
        return;
      }

      url.slug = customSlug;
    }

    await urlRepository.save(url);

    // Use frontend URL instead of backend URL
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const shortUrl = `${frontendUrl}/${url.slug}`;
    const qrCode = await QRCode.toDataURL(shortUrl);

    res.status(200).json({
      data: {
        type: "urls",
        id: url.id,
        attributes: {
          originalUrl: url.originalUrl,
          shortUrl,
          slug: url.slug,
          qrCode,
          visitCount: url.visitCount,
          createdAt: url.createdAt,
          updatedAt: url.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error("Error updating URL:", error);
    res.status(500).json({
      errors: [
        {
          status: "500",
          title: "Server Error",
          detail: "An error occurred while updating the URL",
        },
      ],
    });
  }
};

/**
 * Retrieves all URLs belonging to the authenticated user
 * Returns a list of URL details with QR codes
 * Requires authentication
 */
export const getUserUrls = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        errors: [
          {
            status: "401",
            title: "Unauthorized",
            detail: "You must be logged in to view your URLs",
          },
        ],
      });
      return;
    }

    const urls = await urlRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: "DESC" },
    });

    const baseUrl = process.env.BASE_URL || "http://localhost:4000";

    const urlData = await Promise.all(
      urls.map(async (url) => {
        const shortUrl = `${baseUrl}/${url.slug}`;
        const qrCode = await QRCode.toDataURL(shortUrl);

        return {
          type: "urls",
          id: url.id,
          attributes: {
            originalUrl: url.originalUrl,
            shortUrl,
            slug: url.slug,
            qrCode,
            visitCount: url.visitCount,
            createdAt: url.createdAt,
            updatedAt: url.updatedAt,
          },
        };
      })
    );

    res.status(200).json({
      data: urlData,
    });
  } catch (error) {
    console.error("Error getting user URLs:", error);
    res.status(500).json({
      errors: [
        {
          status: "500",
          title: "Server Error",
          detail: "An error occurred while retrieving your URLs",
        },
      ],
    });
  }
};

/**
 * Assigns an unowned URL to the authenticated user
 * Allows users to claim URLs that were created anonymously
 * Prevents claiming URLs that already belong to other users
 */
export const assignToUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        errors: [
          {
            status: "401",
            title: "Unauthorized",
            detail: "You must be logged in to assign a URL to your account",
          },
        ],
      });
      return;
    }

    // Find the URL
    const url = await urlRepository.findOne({
      where: { id },
      relations: { user: true },
    });

    if (!url) {
      res.status(404).json({
        errors: [
          {
            status: "404",
            title: "Not Found",
            detail: "URL not found",
          },
        ],
      });
      return;
    }

    // Check if URL is already assigned to a user
    if (url.user) {
      res.status(409).json({
        errors: [
          {
            status: "409",
            title: "Conflict",
            detail: "This URL is already assigned to a user",
          },
        ],
      });
      return;
    }

    // Get the user
    const user = await userRepository.findOneBy({ id: userId });
    if (!user) {
      res.status(404).json({
        errors: [
          {
            status: "404",
            title: "Not Found",
            detail: "User not found",
          },
        ],
      });
      return;
    }

    // Assign URL to user
    url.user = user;
    await urlRepository.save(url);

    const shortUrl = `${process.env.BASE_URL || "http://localhost:4000"}/${
      url.slug
    }`;
    const qrCode = await QRCode.toDataURL(shortUrl);

    res.status(200).json({
      data: {
        type: "urls",
        id: url.id,
        attributes: {
          originalUrl: url.originalUrl,
          shortUrl,
          slug: url.slug,
          qrCode,
          visitCount: url.visitCount,
          createdAt: url.createdAt,
          updatedAt: url.updatedAt,
        },
        relationships: {
          user: {
            data: { type: "users", id: user.id },
          },
        },
      },
    });
  } catch (error) {
    console.error("Error assigning URL to user:", error);
    res.status(500).json({
      errors: [
        {
          status: "500",
          title: "Server Error",
          detail: "An error occurred while assigning the URL to your account",
        },
      ],
    });
  }
};
