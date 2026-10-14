import logo from "../assets/lendsqr-logo.svg";

interface LogoProps {
  compact?: boolean;
}

export default function Logo({ compact = false }: LogoProps) {
  return (
    <a
      className={`brand-logo${compact ? " brand-logo--compact" : ""}`}
      href="/login"
      aria-label="Lendsqr home"
    >
      <img src={logo} alt="" />
    </a>
  );
}
