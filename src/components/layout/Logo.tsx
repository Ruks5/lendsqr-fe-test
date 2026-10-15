import logo from '@/assets/images/logo.png';

export function Logo({ className, height = 30 }: { className?: string; height?: number }) {
  return <img src={logo} alt="Lendsqr" className={className} height={height} width={Math.round(height * 4.8)} />;
}
