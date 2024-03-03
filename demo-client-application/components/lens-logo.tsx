

import Image from 'next/image'

export default function LensLogo() {
  return (
    <Image
      src="/lens.svg"
      alt="Lens Logo"
      className="dark:invert"
      width={200}
      height={24}
      priority
    />
  )
}