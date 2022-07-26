import classNames from 'classnames';
import urlMaker from 'helpers/urlMaker';
import LusiThumbnail from 'containers/nft/LusiThumbnail';
import Loading from 'components/Loading';
import styles from './styles.module.scss';

function CollectionNftsData({ collectionNfts }) {
  if (!collectionNfts) {
    return (
      <div className={styles['loading-nfts-container']}>
        <Loading size={48} />
      </div>
    );
  }
  return (
    <div className={classNames('row', styles.row, styles['m-t-row'])}>
      {collectionNfts?.map((item) => (
        <div
          key={item.number}
          className={classNames('col-xl-3 col-lg-4 col-md-4 col-sm-4 col-12', styles.col, styles['m-t-col'])}
        >
          <LusiThumbnail
            name={`Lusi-${item.number}`}
            imgSrc={item.imageUrl}
            price={item.price}
            url={urlMaker.nft.item.root(item.Collection.slug, item.number)}
          />
        </div>
      ))}
    </div>
  );
}

export default CollectionNftsData;
