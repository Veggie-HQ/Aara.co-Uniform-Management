import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [formData, setData] = useState([]);
  const [mobNumber, setMobNumber] = useState("");

  var url =
    "https://sheets.googleapis.com/v4/spreadsheets/" +
    "1CqZttj_vZxXk26efpcSLG4iAv7TVSsn5rHdYfG2_-Vo" +
    "/values/" +
    "Sheet1" +
    "?alt=json&key=" +
    "AIzaSyBDkZsAZZwtRd9yNEc58sfMlyiBIliYQWE";

  async function dataFetcher() {
    const res = await fetch(url);
    const data = await res.json();
    return data;
  }

  function dataExporter() {
    return dataFetcher().then((res) => setData(res["values"]));
  }

  // function stateExporter(x) {
  //   setData(x["values"]);
  // }

  let orderArr = [];

  for (let i = 1; i < formData.length; i++) {
    // console.log(i + "\t" + formData[i]);
    let orderDetails = String(formData[i]).split(",");
    console.log(orderDetails);
    orderArr.push(orderDetails);
    // if (orders[i][4] === mobNumber) {
    //   console.log(orders[i]);
    // }
  }

  function dataDisplay() {
    for (let i = 0; i < orderArr.length; i++) {
      if (mobNumber === orderArr[i][4]) {
        // console.log(orderArr[i]);
        return <p>{orderArr[i]}</p>;
      }
    }
  }

  useEffect(() => {
    // setInterval(function () {
    dataExporter();
    // }, 5000);
  }, []);

  const numberHandler = (e) => {
    setMobNumber(e.target.value);
  };

  const submitHandler = (event) => {
    event.preventDefault();
  };

  return (
    <div>
      <div>
        {/* {oD.map((item, index) => (
          <p key={index}>{item}</p>
        ))} */}
        {dataDisplay}
        <form class="form" onSubmit={submitHandler}>
          <label class="form_item" for="ph">
            Enter Parent's Number
          </label>
          <br />
          <input
            class="form_item text"
            type="text"
            id="ph"
            name="ph"
            onChange={numberHandler}
          />
          <br />
          <button type="submit" class="form_item button search">
            Search
          </button>
        </form>
      </div>
      <div>
        <table class="table">
          <tr>
            <th>Student Name</th>
            <th>Class</th>
            <th>Gender</th>
            <th>Parent's No.</th>
            <th>Select Student</th>
          </tr>
          <tr>
            <td>Rishit</td>
            <td>8</td>
            <td>Male</td>
            <td>9844025859</td>
            <td>
              <div class="radio">
                <input type="radio" name="select student" />
              </div>
            </td>
          </tr>
          <tr>
            <td>Anu</td>
            <td>4</td>
            <td>Female</td>
            <td>9844025859</td>
            <td>
              <div class="radio">
                <input type="radio" name="select student" />
              </div>
            </td>
          </tr>
        </table>
        <div class="button_container">
          <button class="button select_student">Select Student</button>
        </div>
      </div>

      <div>
        <table class="table">
          <tr>
            <th>Item</th>
            <th>Size</th>
            <th>Quanitity</th>
            <th>Price</th>
          </tr>
          <tr>
            <td>Shorts</td>
            <td>L</td>
            <td>2</td>
            <td>400</td>
          </tr>
          <tr>
            <td>T shirts</td>
            <td>XL</td>
            <td>2</td>
            <td>400</td>
          </tr>
        </table>
        <p class="total">Total: 4500.00</p>
      </div>
      <div class="button_container">
        <button class="button confirm">Confirm order</button>
      </div>
    </div>
  );
}

export default App;
