import Product, { IProduct } from "../models/productModel";
import cloudinary from "../config/cloudinary";


export const uploadImageToCloudinary = async (
  file: Express.Multer.File
): Promise<string> => {
  const result = await cloudinary.uploader.upload(file.path, {
    folder: "products",
  });
  return result.secure_url;
};


export const createProduct = async (
  productData: IProduct
): Promise<IProduct> => {
  const newProduct = new Product(productData);
  return await newProduct.save();
};


export const updateProduct = async (
  id: string,
  productData: Partial<IProduct>
): Promise<IProduct | null> => {
  return await Product.findByIdAndUpdate(id, productData, { new: true });
};


export const deleteProduct = async (id: string): Promise<IProduct | null> => {
  return await Product.findByIdAndDelete(id);
};

export const getAllProducts = async (): Promise<IProduct[]> => {
  return await Product.find();
};


export const getProductById = async (id: string): Promise<IProduct | null> => {
  return await Product.findById(id);
};
