const ImageKit = require('imagekit');

// lazy initialization — only creates the instance when actually needed
// prevents crash if env vars aren't loaded yet
let imagekitInstance = null;

const getImageKit = () => {
  if (!imagekitInstance) {
    imagekitInstance = new ImageKit({
      publicKey:   process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey:  process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
    });
  }
  return imagekitInstance;
};

const uploadImage = async (buffer, filename) => {
  const imagekit = getImageKit();
  const uniqueFileName = `${Date.now()}_${filename}`;

  const response = await imagekit.upload({
    file:     buffer.toString('base64'),
    fileName: uniqueFileName,
    folder:   '/grain-posts',
  });

  return response.url;
};

module.exports = { uploadImage };