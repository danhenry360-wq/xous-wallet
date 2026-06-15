import { AssetSymbol } from "../lib/types";

const paths: Record<AssetSymbol, JSX.Element> = {
  BTC: (
    <path
      fill="#fff"
      d="M17.06 10.6c.24-1.6-.98-2.46-2.64-3.03l.54-2.16-1.32-.33-.52 2.1c-.35-.09-.7-.17-1.06-.25l.53-2.12-1.31-.33-.54 2.16c-.29-.07-.57-.13-.84-.2v-.01l-1.82-.45-.35 1.4s.98.23.96.24c.53.13.63.49.61.77l-.62 2.46c.04.01.09.02.14.05l-.14-.04-.86 3.45c-.07.16-.23.4-.61.31.01.02-.96-.24-.96-.24l-.65 1.5 1.72.43c.32.08.63.16.94.24l-.55 2.18 1.31.33.54-2.16c.36.1.71.19 1.05.27l-.54 2.15 1.32.33.54-2.18c2.24.42 3.93.25 4.64-1.78.57-1.63-.03-2.57-1.21-3.18.86-.2 1.51-.77 1.68-1.94zm-3 4.2c-.41 1.64-3.16.75-4.05.53l.72-2.89c.89.22 3.76.66 3.33 2.36zm.41-4.22c-.37 1.49-2.66.73-3.4.55l.65-2.62c.74.18 3.14.53 2.75 2.07z"
    />
  ),
  ETH: (
    <g fill="#fff">
      <path d="M12 3.5 7.5 12l4.5 2.7L16.5 12 12 3.5z" opacity=".9" />
      <path d="M12 15.6 7.5 12.9 12 20.5l4.5-7.6-4.5 2.7z" opacity=".6" />
    </g>
  ),
  USDT: (
    <g fill="#fff">
      <path d="M12 4h7v2.6h-4.7v1.5c3.1.2 5.4.9 5.4 1.8s-2.3 1.6-5.4 1.8v4.3h-2.6v-4.3c-3.1-.2-5.4-.9-5.4-1.8s2.3-1.6 5.4-1.8V6.6H5V4h7zm-.3 7.4c2.5 0 4.6-.4 5.1-.9-.4-.4-2.1-.8-4.2-.9v.9c-.3 0-.6.01-.9.01s-.6 0-.9-.01v-.9c-2.1.1-3.8.5-4.2.9.5.5 2.6.9 5.1.9z" />
    </g>
  ),
};

export function AssetGlyph({
  symbol,
  size = 36,
  color,
}: {
  symbol: AssetSymbol;
  size?: number;
  color: string;
}) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-full shadow-[0_4px_14px_-4px_rgba(0,0,0,0.6)] ring-1 ring-white/10"
      style={{ width: size, height: size, background: color }}
    >
      <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 24 24">
        {paths[symbol]}
      </svg>
    </span>
  );
}
