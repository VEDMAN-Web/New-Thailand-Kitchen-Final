const express = require("express");
const cms = require("../controller/cmsController");
const ai = require("../controller/aiController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Public reads (website + admin bootstrapping)
router.get("/sites", cms.listSites);
router.get("/:siteId/home", cms.getHome);
router.get("/:siteId/categories", cms.listCategories);
router.get("/:siteId/products", cms.listProducts);
router.get("/:siteId/blogs", cms.listBlogs);
router.get("/:siteId/legal/:type", cms.getLegal);
router.get("/:siteId/gallery", cms.listGallery);
router.get("/:siteId/catalogues", cms.listCatalogues);
router.get("/:siteId/faqs", cms.listFaqs);

// Protected writes (admin panel)
router.put("/:siteId/home", protect, cms.updateHome);
router.post("/:siteId/home/reset", protect, cms.resetHome);

router.post("/:siteId/categories", protect, cms.createCategory);
router.put("/:siteId/categories/:id", protect, cms.updateCategory);
router.delete("/:siteId/categories/:id", protect, cms.deleteCategory);

router.post("/:siteId/products", protect, cms.createProduct);
router.put("/:siteId/products/:id", protect, cms.updateProduct);
router.delete("/:siteId/products/:id", protect, cms.deleteProduct);

router.post("/:siteId/blogs/generate-ai", protect, ai.generateBlog);
router.post("/:siteId/blogs/generate-ai-image", protect, ai.generateBlogImage);
router.post("/:siteId/blogs", protect, cms.createBlog);
router.put("/:siteId/blogs/:id", protect, cms.updateBlog);
router.delete("/:siteId/blogs/:id", protect, cms.deleteBlog);

router.put("/:siteId/legal/:type", protect, cms.updateLegal);

router.post("/:siteId/gallery", protect, cms.createGalleryItem);
router.put("/:siteId/gallery/:id", protect, cms.updateGalleryItem);
router.delete("/:siteId/gallery/:id", protect, cms.deleteGalleryItem);

router.post("/:siteId/catalogues", protect, cms.createCatalogue);
router.put("/:siteId/catalogues/:id", protect, cms.updateCatalogue);
router.delete("/:siteId/catalogues/:id", protect, cms.deleteCatalogue);

router.post("/:siteId/faqs", protect, cms.createFaq);
router.put("/:siteId/faqs/:id", protect, cms.updateFaq);
router.delete("/:siteId/faqs/:id", protect, cms.deleteFaq);

module.exports = router;
