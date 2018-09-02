interface NavbarProps {

}

interface OpenGraphMeta {
  property: String;
  content: String;
}

interface ServerSideRenderData {
  html?: String;
  initialState?: Object;
  og?: Array<OpenGraphMeta>; // Facebook Open Graph
  req?: import('express').Request | Object;
  title?: String;
}