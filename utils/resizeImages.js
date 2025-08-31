module.exports.getResizedImageUrl = (imageUrl) => {
  // If the URL contains "res.cloudinary.com", it's already hosted on Cloudinary
  if (imageUrl.includes("res.cloudinary.com")) {
    return imageUrl.replace("/upload", "/upload/w_250");
  } else {
    // Otherwise, use Cloudinary Fetch method for external URLs
    const cloudName = process.env.CLOUD_NAME; // replace with your Cloudinary cloud name
    return `https://res.cloudinary.com/${cloudName}/image/fetch/w_250/${encodeURIComponent(imageUrl)}`;
  }
}