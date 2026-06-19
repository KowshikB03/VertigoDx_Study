/** @type {import('next').NextConfig} */
const nextConfig = {
  // node:sqlite is a built-in; mark it external so webpack doesn't try to bundle it
  serverExternalPackages: ["node:sqlite"],
};

export default nextConfig;
