interface NavbarProps {

}

interface OpenGraphMeta {
  property: String;
  content: String;
}

interface ServerSideRenderData {
  html?: String;
  initialState?: Object;
  og?: OpenGraphMeta[]; // Facebook Open Graph
  req?: import('express').Request | Object;
  title?: String;
}