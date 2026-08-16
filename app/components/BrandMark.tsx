import Image from "next/image";

export function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <Image
        src="/media/siang-yin-logo.png"
        alt=""
        width={72}
        height={72}
        unoptimized
        priority
      />
    </span>
  );
}
