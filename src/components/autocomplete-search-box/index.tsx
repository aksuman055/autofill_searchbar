import * as React from "react";
import "./index.scss";
import { PersonsData, PersonsCard } from "../person-card";
import { historyData } from "../history-card";
import { isArray } from "util";
import jsPDF from "jspdf";
import { renderToString } from "react-dom/server";

export type AutocompleteSearchBoxProps = {};

export type PersonsDataList = PersonsData[];
export type historyDataList = historyData[];

interface State {
  data?: PersonsDataList;
  foundList?: PersonsDataList;
  value?: string;
  error?: string;
  indexOfSelected?: number;
  done?: boolean;
  mouseDown?: boolean;
  history?: historyDataList;
}

export class AutocompleteSearchBox extends React.Component<
  AutocompleteSearchBoxProps,
  State
> {
  state: State = {};

  constructor(props: AutocompleteSearchBoxProps) {
    super(props);
    this.print = this.print.bind(this);
  }

  isDataLoading = false;

  print() {
    console.log("clicked")
    const doc = new jsPDF();
    fetch('https://random-12.herokuapp.com/search/')
      .then(response => response.json())
      .then(data => {
        const text = JSON.stringify(data)
        var a = data;
        var count = 0;
        doc.text("List of searched queries", 10, 10 + count);
        for (var i in a) {
          for (var j in a[i]) {
            console.log(a[i][j].value + "----> " + a[i][j].key);
            var k = a[i][j].value + "----> " + a[i][j].key;
            doc.text(k, 10, 20 + count);
            count = count + 10;
          }
        }
        doc.save("a4.pdf");
      })


    // doc.text();

  }

  async loadData() {
    this.isDataLoading = true;
    let response = await fetch(
      `https://my-json-server.typicode.com/aksuman055/local-db/data`
    );
    this.isDataLoading = false;
    if (response.ok) {
      return (await response.json()) as PersonsDataList;
    }
  }

  findFromPerson(personData: PersonsData, searchValue: string) {
    const foundInfo: {
      key: string;
      value: string;
    }[] = [];
    const found = Object.entries(personData).find(([key, value]) => {
      if (isArray(value)) {
        return (
          value.find((nestedValue) => {
            const isFound = nestedValue
              .toLocaleLowerCase()
              .startsWith(searchValue);
            if (isFound) {
              foundInfo.push({
                key,
                value: nestedValue,
              });
            }
            return isFound;
          }) !== undefined
        );
      } else {
        const isFound = value.toLocaleLowerCase().startsWith(searchValue);
        if (isFound)
          foundInfo.push({
            key,
            value,
          });
        return isFound;
      }
    });
    return found ? foundInfo : undefined;
  }

  async findData() {
    if (this.isDataLoading) return;
    const data = this.state.data ? this.state.data : await this.loadData();

    if (data === undefined) {
      this.setState({
        error: "Error while loading data.",
        indexOfSelected: undefined,
      });
      return;
    }

    const searchValue = this.state.value?.toLocaleLowerCase().trim();
    const foundList: PersonsDataList = [];
    if (searchValue) {
      for (let index = 0; index < data.length; index++) {
        const personData = data[index];
        const isContainValue =
          this.findFromPerson(personData, searchValue) !== undefined;
        if (isContainValue) {
          foundList.push(personData);
        }
      }
    }

    this.setState({
      data,
      foundList: foundList,
      indexOfSelected: undefined,
    });
  }

  onSearch(value?: string) {
    this.setState(
      {
        value: value,
        data: value ? this.state.data : undefined,
        foundList: undefined,
        indexOfSelected: undefined,
        done: undefined,
      },
      () => {
        if (value) {
          this.findData();
        }
      }
    );
  }

  keyboardEnter() {
    this.onSelect();
  }

  keyboardUp() {
    const foundList = this.state.foundList;
    if (foundList) {
      let indexOfSelected = this.state.indexOfSelected;
      if (!indexOfSelected || indexOfSelected - 1 < 0) {
        indexOfSelected = foundList.length - 1;
      } else {
        indexOfSelected--;
      }
      this.setState(
        {
          indexOfSelected,
        },
        () => {
          this.scrollToTarget();
        }
      );
    }
  }

  onSelect() {
    const searchValue = this.state.value?.toLocaleLowerCase().trim();
    if (
      this.state.indexOfSelected !== undefined &&
      this.state.foundList &&
      searchValue
    ) {
      const data = this.state.foundList[this.state.indexOfSelected];
      const foundInfo = this.findFromPerson(data, searchValue);
      // console.log(data);
      console.log(foundInfo);
      // console.log(searchValue);

      // const query = { query:  };
      const searchData = JSON.stringify(foundInfo);
      console.log(searchData);

      fetch('https://random-12.herokuapp.com/search/', {
        method: 'POST', // or 'PUT'
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(foundInfo),
      })
        .then(response => response.json())
        // .then(query => {
        //   console.log('Success:', query);
        //   // console.log(query[0].value);
        //   const hist = query[0].value;
        //   this.setState({
        //     history: hist
        //   })
        // }
        // )
        .catch((error) => {
          console.error('Error:', error);
        });
      // console.log(this.state.history);


      if (foundInfo) {
        this.setState({
          data: undefined,
          foundList: undefined,
          done: true,
          value: foundInfo[0].value,
        });
      }
    }
  }

  scrollToTarget() {
    const element = this.personsCardRef?.current?.personsCardDivRef.current;
    if (element) {
      const parentElement = element.parentElement;
      if (parentElement) {
        const elementBound = element.getBoundingClientRect();
        const parentBound = parentElement.getBoundingClientRect();
        if (
          !(
            parentBound.top < elementBound.top &&
            parentBound.bottom > elementBound.bottom
          )
        ) {
          element.scrollIntoView({
            block: "start",
            behavior: "smooth",
          });
        }
      }
    }
  }

  keyboardDown() {
    const foundList = this.state.foundList;
    if (foundList) {
      let indexOfSelected = this.state.indexOfSelected;
      if (
        indexOfSelected === undefined ||
        indexOfSelected + 1 > foundList.length - 1
      ) {
        indexOfSelected = 0;
      } else {
        indexOfSelected++;
      }
      this.setState(
        {
          indexOfSelected,
        },
        () => {
          this.scrollToTarget();
        }
      );
    }
  }

  render(): React.ReactNode {
    return (
      <div>
        <div className="but">
          <button className="button" onClick={this.print}>Download</button></div>
        <div className="autocomplete-search-box">
          <input
            placeholder="Search"
            value={this.state.value || ""}
            onBlur={(event) => {
              this.setState({
                data: undefined,
                foundList: undefined,
              });
            }}
            onFocus={(event) => {
              if (event.target.value) {
                this.findData();
              }
            }}
            onChange={(event) => {
              this.onSearch(event.target.value);
            }}
            onKeyUp={(event) => {
              const key = event.key;
              if (key === "ArrowUp") {
                this.keyboardUp();
              } else if (key === "ArrowDown") {
                this.keyboardDown();
              } else if (key === "Enter") {
                this.keyboardEnter();
              }
            }}
          />
          {
            this.state.foundList &&
            this.state.done !== true &&
            this.getFoundList(this.state.foundList)
          }
        </div >
      </div>
    );
  }

  personsCardRef = React.createRef() as React.RefObject<PersonsCard>;

  getFoundList(foundData: PersonsDataList) {
    return (
      <div className="holder">
        <div className="list">
          {foundData.length ? (
            foundData.map((personData, index) => {
              const isSelected = index === this.state.indexOfSelected;
              return (
                <PersonsCard
                  ref={isSelected ? this.personsCardRef : undefined}
                  isFocused={isSelected}
                  key={personData.id}
                  data={personData}
                  highlightText={this.state.value}
                  onMouseOver={() => {
                    this.setState({
                      indexOfSelected: index,
                    });
                  }}
                  onMouseDown={() => {
                    this.onSelect();
                  }}
                />
              );
            })
          ) : (
            <div className="no-data">
              <div className={"text"}>No User Found</div>
            </div>
          )}
        </div>
      </div>
    );
  }
}
