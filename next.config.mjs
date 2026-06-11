/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.thecatapi.com",
      },
    ],
    unoptimized: true,
  },
};

export default nextConfig;