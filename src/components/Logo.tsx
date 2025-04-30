import Image from 'next/image';
import Link from 'next/link';
import React from 'react'

export const Logo = () => {
  return (
      <div>
          <Link href="/" className="flex items-center gap-2">
              <Image src="/images/logo.png" alt="Logo" width={32} height={32} />
              <span className="font-semibold text-lg">UnityCRM</span>
          </Link>
      </div>
  );
}
