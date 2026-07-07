import localFont from "next/font/local";

export const montserrat = localFont({
    src: [
      {
        path: './montserrat/montserrat-latin-300-normal.woff2',
        weight: '300',
        style: 'normal',
      },
      {
        path: './montserrat/montserrat-latin-400-normal.woff2',
        weight: '400',
        style: 'normal',
      },
      {
        path: './montserrat/montserrat-latin-500-normal.woff2',
        weight: '500',
        style: 'normal',
      },
      {
        path: './montserrat/montserrat-latin-600-normal.woff2',
        weight: '600',
        style: 'normal',
      },
      {
        path: './montserrat/montserrat-latin-700-normal.woff2',
        weight: '700',
        style: 'normal',
      },
    ],
    variable: "--font-montserrat",
  })
  
export const kanit = localFont({
    src: './kanit/kanit-latin-600-normal.woff2',
    variable: "--font-kanit",
    style: 'normal',
    weight: '600',
  })