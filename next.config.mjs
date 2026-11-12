/** @type {import('next').NextConfig} */
// Static export for Firebase Hosting (free Spark plan). Security headers live in firebase.json.
const nextConfig = {
  output: "export",
  trailingSlash: false,
  images: { unoptimized: true },
  poweredByHeader: false,
};

export default nextConfig;
