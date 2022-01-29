import { faBlog, faHome } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import Link from "next/link";
import React from "react";

import * as Logos from "../images/logos";

export const Header: React.FC = () => (
  <header className="flex justify-between items-center p-3 mb-8">
    <div className="flex flex-wrap gap-6">
      <Link href="/">
        <div className="flex gap-2 items-center">
          <FontAwesomeIcon className="text-cyan-700" icon={faHome} />
          <div>Home</div>
        </div>
      </Link>
      <Link href="/blog">
        <div className="flex gap-2 items-center">
          <FontAwesomeIcon className="text-cyan-700" icon={faBlog} />
          <div>Blog</div>
        </div>
      </Link>
    </div>
    <Image
      alt="Beaunus Logo"
      height={25}
      priority={true}
      quality={100}
      src={Logos.BeaunusPixels}
      width={119.25}
    />
  </header>
);
