import { useRouter } from 'next/router';
import Head from 'next/head';
import numeral from 'numeral';

const SpotHead = ({ tokens, price }) => {
  const router = useRouter();
  const formattedPrice = numeral(price).format('0.[00]');
  let pageTitle = `${formattedPrice} | XLM-USDC | Lumenswap`;

  if (tokens) {
    pageTitle = `${formattedPrice} | ${tokens.from.code} to ${tokens.to.code} | Lumenswap`;
  } else if (router.pathname.split('/').includes('custom')) {
    pageTitle = `${formattedPrice} | Custom | Lumenswap`;
  }

  return (
    <Head>
      <title>{pageTitle}</title>
      <meta name="description" content={`Exchange ${tokens ? `${tokens.from.code}-${tokens.to.code}` : 'custom pair'} in Decentralized Exchanged on Stellar | Find All Live Stellar Assets Chart, Graph and Price in Lumenswap.`} />
      <meta name="robots" content="follow, index" />
      <link rel="canonical" herf={`${process.env.REACT_APP_HOST}/spot/${tokens ? `${tokens.from.code}-${tokens.to.code}` : 'custom'}`} />
    </Head>
  );
};

export default SpotHead;