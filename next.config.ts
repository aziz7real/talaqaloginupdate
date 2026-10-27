import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Dev only: lets a phone on the same Wi-Fi load the dev server with live reload.
  // Update the IP if your computer's local address changes.
  allowedDevOrigins: ["192.168.100.39"],
  async redirects() {
    // Arabic is the default experience.
    return [{ source: "/", destination: "/ar", permanent: false }];
  },
};

export default nextConfig;
