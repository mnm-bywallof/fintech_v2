import { Container, Navbar } from "react-bootstrap";
import logo from "../../Assets/logo.png";

const NavB: React.FC = () => {
  return (
    <Navbar className="bg-body-tertiary">
      <Container>
        <Navbar.Brand href="#home">
          <img
            alt=""
            src={logo}
            height="30"
            className="d-inline-block align-top"
          />{" "}
        </Navbar.Brand>
      </Container>
    </Navbar>
  );
};

export default NavB;
