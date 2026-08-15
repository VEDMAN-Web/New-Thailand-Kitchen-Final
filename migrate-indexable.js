const mongoose = require('mongoose');
require('./src/model/cmsModels');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cms';

async function migrate() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const Category = mongoose.model('CmsCategory');
    const Product = mongoose.model('CmsProduct');
    const Gallery = mongoose.model('CmsGalleryItem');

    // Set indexable: false for all records that don't have the field
    const catResult = await Category.updateMany(
      { indexable: { $exists: false } },
      { $set: { indexable: false } }
    );
    console.log(`Categories updated: ${catResult.modifiedCount}`);

    const prodResult = await Product.updateMany(
      { indexable: { $exists: false } },
      { $set: { indexable: false } }
    );
    console.log(`Products updated: ${prodResult.modifiedCount}`);

    const galResult = await Gallery.updateMany(
      { indexable: { $exists: false } },
      { $set: { indexable: false } }
    );
    console.log(`Gallery items updated: ${galResult.modifiedCount}`);

    console.log('Migration complete!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
