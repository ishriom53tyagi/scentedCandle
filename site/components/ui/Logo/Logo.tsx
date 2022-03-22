import Image from "next/image"
import logoImage from '../../../../site/public/assets/logo.png';

const Logo = ({ className = '', ...props }) => (
  <Image src={logoImage} alt={"logo"} width={45} height={45}/>
)

export default Logo
