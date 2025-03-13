/** @type {import('next').NextConfig} */
const nextConfig = {
  //output: 'export',
  // Cloudflare Pages에 최적화된 설정
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
