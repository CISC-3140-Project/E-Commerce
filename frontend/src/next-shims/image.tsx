import type { ImgHTMLAttributes } from "react"

type NextImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src: string
  alt: string
  fill?: boolean
  priority?: boolean
  sizes?: string
}

export default function Image({ src, alt, fill, style, ...rest }: NextImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      style={{
        ...(fill
          ? {
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
            }
          : null),
        ...style,
      }}
      {...rest}
    />
  )
}

