import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [formData, setData] = useState([]);
  const [mobNumber, setMobNumber] = useState("");
  const [selStud, setSelStud] = useState(0);
  const [confirmed, setConfirmed] = useState(false);

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
  let nextItem;
  let columnsplit = [];

  const invoiceDownloader = (event) => {
    const file = new Blob([filteredOrders[selStud]], { type: "text/plain" });
    const element = document.createElement("a");
    element.href = URL.createObjectURL(file);
    element.download = `invoice` + `.pdf`;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  };

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
              <th>Email</th>
              <th>Select Student</th>
            </tr>
            {/* Select the order you want to confirm */}
            {filteredOrders != 0
              ? filteredOrders.map((item, index) => (
                  <tr>
                    <td key={index}>{item[1]}</td>
                    <td key={index}>{item[3]}</td>
                    <td key={index}>{item[6]}</td>
                    <td key={index}>{item[4]}</td>
                    <td key={index}>{item[7]}</td>
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
        </div>

        <div>
          {/* Display Order Details */}
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
                    {index <= 9 ? (
                      ""
                    ) : (
                      <>
                        {
                          // <span className="useless">
                          //   {" "}
                          //   {(nextItem = elements + 1)}
                          // </span>
                        }

                        {item !== "" ? (
                          <>
                            {
                              <span className="useless">
                                {(columnsplit = formData[0][index].split(" "))}
                                {(itemsplit = item.split(" "))}
                              </span>
                            }
                            {counter % 2 !== 0 ? (
                              <>
                                {formData[0][index].includes("Tie") ||
                                formData[0][index].includes("Belt") ? (
                                  <>
                                    <tr>
                                      <td key={index}>{formData[0][index]}</td>
                                      <td key={index}>-</td>
                                      <td key={index}>{item}</td>
                                      {/* Tie Long Price for M14 and */}
                                      {formData[0][index].includes("Tie") &&
                                      formData[0][index].includes("S512") ? (
                                        <td key={index}>{item * 150}</td>
                                      ) : (
                                        <>
                                          {formData[0][index].includes("Tie") &&
                                          formData[0][index].includes("M14") ? (
                                            <td key={index}>{item * 100}</td>
                                          ) : (
                                            ""
                                          )}
                                        </>
                                      )}

                                      {/* Tie Knot */}
                                      {(formData[0][index].includes(
                                        "Tie Knot"
                                      ) &&
                                        formData[0][index].includes("F14")) ||
                                      (formData[0][index].includes(
                                        "Tie Knot"
                                      ) &&
                                        formData[0][index].includes("M14")) ||
                                      (formData[0][index].includes(
                                        "Tie Knot"
                                      ) &&
                                        formData[0][index].includes("O14")) ? (
                                        <td key={index}>{item * 100}</td>
                                      ) : (
                                        ""
                                      )}

                                      {/* Belt Price */}
                                      {formData[0][index].includes("Belt") ? (
                                        <td key={index}>{item * 100}</td>
                                      ) : (
                                        ""
                                      )}
                                      <span className="useless">
                                        {counter++}
                                      </span>
                                    </tr>
                                  </>
                                ) : (
                                  // For all Other Items
                                  <tr>
                                    <td key={index}>{formData[0][index]}</td>
                                    <td key={index}>{item}</td>
                                    <td key={index}>{elements[index + 1]}</td>

                                    {/* Winter Jacket */}
                                    {(formData[0][index].includes(
                                      "Winter Jacket"
                                    ) &&
                                      formData[0][index].includes("F14")) ||
                                    (formData[0][index].includes(
                                      "Winter Jacket"
                                    ) &&
                                      formData[0][index].includes("M14")) ? (
                                      <td key={index}>
                                        {elements[index + 1] * 550}
                                      </td>
                                    ) : (
                                      <>
                                        {formData[0][index].includes(
                                          "Winter Jacket"
                                        ) &&
                                        formData[0][index].includes("S512") ? (
                                          <td key={index}>
                                            {elements[index + 1] * 650}
                                          </td>
                                        ) : (
                                          ""
                                        )}
                                      </>
                                    )}

                                    {/* Shirts */}
                                    {(formData[0][index].includes("Shirt") &&
                                      formData[0][index].includes("F14")) ||
                                    (formData[0][index].includes("Shirt") &&
                                      formData[0][index].includes("M14")) ? (
                                      <td key={index}>
                                        {elements[index + 1] * 490}
                                      </td>
                                    ) : (
                                      <>
                                        {formData[0][index].includes("Shirt") &&
                                        formData[0][index].includes("S512") ? (
                                          <td key={index}>
                                            {elements[index + 1] * 540}
                                          </td>
                                        ) : (
                                          ""
                                        )}
                                      </>
                                    )}

                                    {/* Trousers */}
                                    {formData[0][index].includes("Trousers") &&
                                    formData[0][index].includes("S512") ? (
                                      <td key={index}>
                                        {elements[index + 1] * 610}
                                      </td>
                                    ) : (
                                      ""
                                    )}

                                    {/* Track Pants */}
                                    {(formData[0][index].includes(
                                      "Track Pants"
                                    ) &&
                                      formData[0][index].includes("F14")) ||
                                    (formData[0][index].includes(
                                      "Track Pants"
                                    ) &&
                                      formData[0][index].includes("M14")) ? (
                                      <td key={index}>
                                        {elements[index + 1] * 380}
                                      </td>
                                    ) : (
                                      <>
                                        {formData[0][index].includes(
                                          "Track Pants"
                                        ) &&
                                        formData[0][index].includes("S512") ? (
                                          <td key={index}>
                                            {elements[index + 1] * 430}
                                          </td>
                                        ) : (
                                          ""
                                        )}
                                      </>
                                    )}

                                    {/* Track T Shirt */}
                                    {formData[0][index].includes(
                                      "Track T-Shirt"
                                    ) && formData[0][index].includes("F14") ? (
                                      <td key={index}>
                                        {elements[index + 1] * 360}
                                      </td>
                                    ) : (
                                      <>
                                        {formData[0][index].includes(
                                          "Track T-Shirt"
                                        ) &&
                                        formData[0][index].includes("S512") ? (
                                          <td key={index}>
                                            {elements[index + 1] * 425}
                                          </td>
                                        ) : (
                                          ""
                                        )}
                                      </>
                                    )}

                                    {/* Blazers */}
                                    {formData[0][index].includes("Blazer") &&
                                    formData[0][index].includes("S512") ? (
                                      <td key={index}>
                                        {elements[index + 1] * 1600}
                                      </td>
                                    ) : (
                                      ""
                                    )}

                                    {/* Shorts */}
                                    {(formData[0][index].includes("Shorts") &&
                                      formData[0][index].includes("M14")) ||
                                    (formData[0][index].includes("Shorts") &&
                                      formData[0][index].includes("F14")) ? (
                                      <td key={index}>
                                        {elements[index + 1] * 490}
                                      </td>
                                    ) : (
                                      ""
                                    )}

                                    {/* Skirts */}
                                    {formData[0][index].includes("Skirt") &&
                                    formData[0][index].includes("F14") ? (
                                      <td key={index}>
                                        {elements[index + 1] * 525}
                                      </td>
                                    ) : (
                                      ""
                                    )}

                                    {/* Socks */}
                                    {(formData[0][index].includes("Socks") &&
                                      formData[0][index].includes("M14")) ||
                                    (formData[0][index].includes("Socks") &&
                                      formData[0][index].includes("F14")) ? (
                                      <td key={index}>
                                        {elements[index + 1] * 90}
                                      </td>
                                    ) : (
                                      <>
                                        {formData[0][index].includes("Socks") &&
                                        formData[0][index].includes("S512") ? (
                                          <td key={index}>
                                            {elements[index + 1] * 90}
                                          </td>
                                        ) : (
                                          ""
                                        )}
                                      </>
                                    )}
                                  </tr>
                                )}
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
          <div className="total_container">
            <p className="total">Split Up: </p>
            <p className="total">Total: 4500.00</p>
          </div>
        </div>
        <div className="button_container">
          {confirmed ? (
            <button className="button confirm" onClick={invoiceDownloader()}>
              Download Invoice
            </button>
          ) : (
            <button
              className="button confirm"
              onClick={() => {
                let p = prompt("Are you sure you want to confirm this order?");
                if (p.localeCompare("y") || p.localeCompare("yes"))
                  setConfirmed(!confirmed);
              }}
            >
              Confirm order
            </button>
          )}

          <button
            className="button confirm reload"
            onClick={() => {
              window.location.reload();
            }}
          >
            Reload Page
          </button>
        </div>
      </div>
    </>
  );
}

export default App;
