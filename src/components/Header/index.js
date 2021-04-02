import { ReactComponent as Logo } from 'assets/images/logo.svg';
import { Link } from 'react-router-dom';
import CustomDropdown from 'components/Dropdown';
import Button from 'components/Button';
import { useSelector } from 'react-redux';
import { openConnectModal } from 'actions/modal';
import styles from './styles.module.scss';

const Header = () => {
  const isLogged = useSelector((state) => state.user.logged);

  return (
    <div className={styles.layout}>
      <ul className={styles.list}>
        <li><Link to="/"><Logo /></Link></li>
        <li><Link to="/">Swap</Link></li>
        {/* <li><Link to="/">Stats <span className="icon-external" /></Link></li> */}
      </ul>
      {isLogged ? <CustomDropdown height="40px" width="160px" />
        : <Button variant="secondary" content="Connect Wallet" className={styles.btn} onClick={openConnectModal} /> }
    </div>
  );
};

export default Header;