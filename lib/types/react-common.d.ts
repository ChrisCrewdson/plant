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

interface InputComboTextProps {
  changeHandler: (e: React.FormEvent<{}>, newValue: string) => void;
  disabled?: boolean;
  error: React.ReactNode;
  fullWidth?: boolean;
  id: string;
  label: React.ReactNode;
  multiLine?: boolean;
  name: string;
  placeholder: string;
  style?: React.CSSProperties;
  type?: string;
  value: string | number;
}
