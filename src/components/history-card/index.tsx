import * as React from "react";
import "./index.scss";

export type historyProps = {
  data: historyData;
  highlightText?: string;
  isFocused?: boolean;
  onMouseOver: () => void;
  onMouseDown: () => void;
};

export type historyData = {
  id: string;
  name: string;
};

interface State { }

export class historyCard extends React.Component<historyProps, State> {
  state: State = {};

  constructor(props: historyProps) {
    super(props);
  }

  historyCardDivRef = React.createRef() as React.RefObject<HTMLDivElement>;

  render(): React.ReactNode {
    const data = this.props.data;
    return (
      <div
        ref={this.historyCardDivRef}
        onMouseOver={() => {
          this.props.onMouseOver();
        }}
        onMouseDown={(event) => {
          this.props.onMouseDown();
        }}
        className={`persons-card ${this.props.isFocused ? "focused" : ""}`}
      >
        <div className="line id">{data.name}</div>

      </div>
    );
  }
}
