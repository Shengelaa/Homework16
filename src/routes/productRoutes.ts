import { Router, Request, Response } from "express";
import multer from "multer";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImageToCloudinary,
  getAllProducts,
  getProductById,
} from "../services/productService";
import { isAdmin } from "../middlewares/authMiddleware";
import { productValidationSchema } from "../validations/productValidation";
import Product from "../models/productModel";

const router = Router();
const upload = multer({ dest: "uploads/" });

router.get("/", async (req: Request, res: Response) => {
  try {
    let limit = parseInt(req.query.limit as string) || 10;
    if (limit > 30) limit = 30;

    const page = parseInt(req.query.page as string) || 1;
    const skip = (page - 1) * limit;

    const search = req.query.search as string;
    const category = req.query.category as string;
    const priceSort = req.query.price as "asc" | "desc";

    const filter: any = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    if (category) {
      filter.category = category;
    }

    const sort: any = {};
    if (priceSort === "asc") sort.price = 1;
    if (priceSort === "desc") sort.price = -1;

    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch products", error: err });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const product = await getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch product", error: err });
  }
});

router.post(
  "/",
  upload.single("image"),
  async (req: Request, res: Response) => {
    try {
      console.log("Request body:", req.body);
      console.log("Uploaded file:", req.file);

      const { error } = productValidationSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details });
      }

      if (!req.file) {
        return res.status(400).json({ error: "Image file is required" });
      }

      const imageUrl = await uploadImageToCloudinary(req.file);
      const newProduct = await createProduct({ ...req.body, imageUrl });

      res.status(201).json(newProduct);
    } catch (err) {
      console.error("Failed to create product:", err);
      res.status(500).json({
        message: "Failed to create product",
        error: err instanceof Error ? err.message : err,
      });
    }
  }
);

router.post("/:id/review", async (req: Request, res: Response) => {
  try {
    const productId = req.params.id;
    const comment = req.headers["comment"] as string;

    if (!productId || !comment) {
      return res
        .status(400)
        .json({ message: "Product ID and comment are required" });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $push: { review: comment } },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(updatedProduct);
  } catch (err) {
    res.status(500).json({ message: "Failed to add comment", error: err });
  }
});

router.put(
  "/:id",
  isAdmin,
  upload.single("image"),
  async (req: Request, res: Response) => {
    try {
      const { error } = productValidationSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details });
      }

      let imageUrl = req.body.imageUrl;
      if (req.file) {
        imageUrl = await uploadImageToCloudinary(req.file);
      }

      const updatedProduct = await updateProduct(req.params.id, {
        ...req.body,
        imageUrl,
      });

      res.status(200).json(updatedProduct);
    } catch (err) {
      res.status(500).json({ message: "Failed to update product", error: err });
    }
  }
);

router.delete("/:id", isAdmin, async (req: Request, res: Response) => {
  try {
    const deletedProduct = await deleteProduct(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete product", error: err });
  }
});

export default router;
