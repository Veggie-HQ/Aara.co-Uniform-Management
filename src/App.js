import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [formData, setData] = useState([]);
  const [mobNumber, setMobNumber] = useState("");
  const [selStud, setSelStud] = useState(0);

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

  let orderArr = [];

  for (let i = 1; i < formData.length; i++) {
    let orderDetails = String(formData[i]).split(",");
    orderArr.push(orderDetails);
  }

  let filteredOrders = [];

  function dataDisplay() {
    for (let i = 0; i < orderArr.length; i++) {
      if (mobNumber === orderArr[i][4]) {
        filteredOrders.push(orderArr[i]);
      }
    }
  }

  dataDisplay();

  useEffect(() => {
    // setInterval(function () {
    dataExporter();
    // }, 5000);
  }, []);

  const numberHandler = (e) => {
    setMobNumber(e.target.value);
  };

  let counter = 1;
  let itemsplit = [];
  let columnsplit = [];
  return (
    <>
      <div>
        <div>
          <div className="form">
            <label className="form_item" htmlFor="ph">
              Enter Parent's Number
            </label>
            <br />
            <input
              className="form_item text"
              type="text"
              id="ph"
              name="ph"
              onChange={numberHandler}
            />
            <br />
          </div>
        </div>
        <div>
          <table className="table student_details" id="student_details">
            <tr>
              <th>Student Name</th>
              <th>Class</th>
              <th>Gender</th>
              <th>Parent's No.</th>
              <th>Select Student</th>
            </tr>
            {filteredOrders != 0
              ? filteredOrders.map((item, index) => (
                  <tr>
                    <td key={index}>{item[1]}</td>
                    <td key={index}>{item[3]}</td>
                    <td key={index}>{item[6]}</td>
                    <td key={index}>{item[4]}</td>
                    <td>
                      <div className="radio">
                        <input
                          type="radio"
                          name="select student"
                          onChange={() => setSelStud(index)}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              : ""}
          </table>
          {/* <div className="button_container">
          <button className="button select_student">Select Student</button>
        </div> */}
        </div>

        <div>
          <table className="table order_details" id="order_details">
            <tr>
              <th>Item</th>
              <th>Size</th>
              <th>Quantity</th>
              <th>Price</th>
            </tr>

            {filteredOrders != 0
              ? filteredOrders[selStud].map((item, index, elements) => (
                  <>
                    {index < 9 ? (
                      ""
                    ) : (
                      <>
                        {item !== "" ? (
                          <>
                            {
                              <span className="useless">
                                {(columnsplit = formData[0][index].split(" "))}
                                {(itemsplit = item.split(" "))}
                                {console.log(columnsplit)}
                              </span>
                            }
                            {counter % 2 !== 0 ? (
                              <>
                                {formData[0][index].includes("Tie") ||
                                formData[0][index].includes("Belt") ? (
                                  <>
                                    <td key={index}>{formData[0][index]}</td>
                                    <td key={index}>-</td>
                                    <td key={index}>{item}</td>
                                    <span className="useless">{counter++}</span>
                                  </>
                                ) : (
                                  ""
                                )}
                                <tr>
                                  <td key={index}>{formData[0][index]}</td>
                                  <td key={index}>{item}</td>
                                  <td key={index}>{elements[index + 1]}</td>
                                </tr>
                              </>
                            ) : (
                              ""
                            )}
                            {/* {
                              <tr>
                                {}
                                <td key={index}>{formData[0][index]}</td>
                                <td key={index}>{item}</td>
                                <td key={index}>{elements[index + 1]}</td>
                                {console.log(item)}
                              </tr>
                            } */}
                            {<span className="useless">{counter++}</span>}
                          </>
                        ) : (
                          ""
                        )}
                        {/* <td key={index}>{formData[0][index]}</td> */}
                        {/* <p>{item}</p> */}
                      </>
                    )}
                  </>
                ))
              : ""}
          </table>
          <p className="total">Total: 4500.00</p>
        </div>
        <div className="button_container">
          <button className="button confirm">Confirm order</button>
        </div>
      </div>
    </>
  );
}

export default App;
