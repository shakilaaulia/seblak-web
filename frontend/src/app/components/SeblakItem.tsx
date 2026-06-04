import React from 'react';
import Image from 'next/image';

interface SeblakItemProps {
  name: string;
  price: string;
  imageSrc: string;
}

const SeblakItem: React.FC<SeblakItemProps> = ({ name, price, imageSrc }) => (
  <div className="bg-white/30 backdrop-blur-md rounded-xl p-4 shadow hover:shadow-lg transition-shadow flex flex-col items-center">
    <Image src={imageSrc} alt={name} width={120} height={120} className="rounded" />
    <h3 className="mt-2 text-lg font-medium text-gray-800 dark:text-gray-200">{name}</h3>
    <p className="mt-1 text-gray-600 dark:text-gray-300">{price}</p>
    <button className="mt-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded hover:opacity-90 transition-opacity">
      Tambah ke Keranjang
    </button>
  </div>
);

export default SeblakItem;
