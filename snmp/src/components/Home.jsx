import React, { Component } from 'react'
import './styles.css'
import { TableDetails, getPagination } from './common'
import $ from 'jquery';
import axios from 'axios';
// import Lottie from 'react-lottie';
import ApexCharts from "react-apexcharts";
// import animationData from '../animations/nographdata.json';


export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: false,
      success: false,
      message: "",
      success2: "",
      error2: false,
      message2: "",
      series: [],
      graphData: [],
      setup_ip: "",
      interfaceName: "",
      static_ip: "",
      staticRouter: "",
      domainName: "",
    }
  }
  componentDidMount() {
    $(".pagination").hide();
    $("#rangeDropdown").hide();
    $(".graph-modal").hide();
    $("#displayModal3").hide();
    this.tableData();
    this.interval = setInterval(() => {
      // window.location.reload();
      this.tableData();
    }, 10 * 1000);
  }

  tableData = () => {
    axios({ method: 'GET', url: "/api/sensor/tracking" })
      .then((response) => {
        console.log(response)
        $("#table_det tbody").empty();
        $("#table_det thead").empty();
        let data = response.data;
        if (response.status === 200 || response.status === 201) {
          console.log("Response====>", response);
          if (data.length !== 0) {
            $("#table_det thead").append(
              "<tr>" +
              "<th>Sr.NO</th>" +
              "<th>MAC ID</th>" +
              "<th>TEMPERATURE (°C)</th>" +
              "<th>HUMIDITY (%RH)</th>" +
              "<th>BATTERY</th>" +
              "<th>LAST SEEN</th>" +
              "<th>STATUS</th>" +
              "<th>HISTORY</th>" +
              "</tr>"
            );
            for (let i = 0; i < data.length; i++) {
              let status = 'red';
              if ((new Date() - new Date(data[i].timestamp)) <= (2 * 60 * 1000)) {
                status = "green";
              }
              $("#table_det tbody").append(
                "<tr>" +
                "<td>" + (i + 1) + "</td>" +
                "<td>" + data[i].macid + "</td>" +
                "<td>" + data[i].temp.toFixed(2) + "</td>" +
                "<td>" + data[i].humi.toFixed(2) + "</td>" +
                "<td>" + data[i].battery + "</td>" +
                "<td>" + data[i].timestamp.replace("T", " ").substr(0, 19) + "</td>" +
                "<td><div class='circle' style='margin:auto;background-color:" + status + ";'></div></td> " +
                "<td><i  id='history_" + i + "' class='imgdiv fas fa-info-circle'></i></td> " +
                "</tr>"
              )
              $("#history_" + i).on("click", () => this.getHistoryData(data[i].id));
            }
            if (data.length > 25) {
              $(".pagination").show();
              $("#rangeDropdown").show();
              getPagination(this, "#table_det");
            }
          } else {
            $(".pagination").hide();
            $("#rangeDropdown").hide();
            this.showMessage(false, true, false, "Data Not Found");
          }
        }
      })
      .catch((error) => {
        console.log(error)
        $(".pagination").hide();
        $("#rangeDropdown").hide();
        if (error.response.status === 404) {
          $("html").animate({ scrollTop: 0 }, "slow");
          this.showMessage(false, true, false, "Data Not Found");
        } else if (error.response.status === 500) {
          this.showMessage(false, true, false, "Internal Server Error");
          $(".common_table").hide();
        }
      })
  }

  getHistoryData = (id) => {
    console.log("----->", id);
    this.setState({ series: [] })
    axios({
      method: "POST", url: "/api/sensor/tracking",
      data: { id: id }
    })
      .then((response) => {
        console.log("------->", response);
        if (response.status === 200) {
          let data = response.data;
          if (data.length !== 0) {
            $("#graphModal1").show();
            let temp = [], humi = [];
            for (let i = 0; i < data.length; i++) {
              let time = data[i].timestamp;
              var date = new Date(time);
              var ms = date.getTime();
              temp.push([ms, data[i].temp.toFixed(2)]);
              humi.push([ms, data[i].humi.toFixed(2)]);
            }
            this.setState({
              series: [{ name: "Temperature(°C)", data: temp },
              { name: "Humidity(RH)", data: humi }]
            });
            this.setState({ graphData: [] })
          } else {
            this.showMessage(true, true, false, "Graph Data Not Found");
          }
        }
      })
      .catch((error) => {
        if (error.response.status === 404) {
          $("html").animate({ scrollTop: 0 }, "slow");
          this.showMessage(true, true, false, "Graph Data Not Found");
        } else if (error.response.status === 500) {
          this.showMessage(false, true, false, "Internal Server Error");
        }
      })
  }

  ValidateIPaddress = (ipaddress) => {
    if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipaddress)) {
      return true;
    } else {
      return false;
    }
  }

  ValidateStaticIP = (ipaddress) => {
    let check = ipaddress.includes("/24");
    let substringIP = ""
    if (check) {
      let ind = ipaddress.indexOf("/24")
      substringIP = ipaddress.substring(0, ind);
    }
    if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(substringIP)) {
      return true;
    } else {
      return false;
    }
  }

  submitBtn = () => {
    clearTimeout(this.timeout2);
    this.setState({ error2: false, message2: "" })
    $("#displayModal3").css("display", "none")
    let interfaceName = $("#interface").val();
    let static_ip = $("#static_ip").val();
    let staticRouter = $("#static_router").val();
    let domainName = $("#domainName").val();
    let jsonData = {
      "static_ip": static_ip,
      "router_ip": staticRouter,
      "interface": interfaceName,
      "domain": domainName
    }
    console.log("$$$$$$$=======>", jsonData);
    if (interfaceName && static_ip && staticRouter && domainName) {
      if (!this.ValidateIPaddress(domainName) || !this.ValidateStaticIP(static_ip) ||
        !this.ValidateIPaddress(staticRouter)) {
        this.setState({ error2: true, message2: "Invalid IP Pattern" })
        this.timeout2 = setTimeout(() => {
          this.setState({ error2: false, message2: "" })
        }, 3 * 1000);
      } else {
        console.log("%%%%%%%%%=====>", new Date());
        $("#displayModal3").css("display", "block")
        axios({
          method: "POST", url: "/api/static/ip",
          data: jsonData
        }).then((response) => {
          if (response.status === 200) {
            this.setState({ success2: true, message2: "Registration Successfully" })
          }
        })
          .catch((error) => {
            if (error.response.status === 400) {
              this.setState({ error2: true, message2: "Bad Request" })
            } else if (error.response.status === 406) {
              this.setState({ error2: true, message2: "Required All Fields" })
            }
          })

        $("#interface").val("");
        $("#static_ip").val("");
        $("#static_router").val("");
        $("#domainName").val("");
      }
    } else {
      this.setState({ error2: true, message2: "Required All Fields" })
    }
  }

  closeConfig = () => {
    this.setState({ error2: false, message2: "" });
    $("#interface").val("");
    $("#static_ip").val("");
    $("#static_router").val("");
    $("#domainName").val("");
    $("#graphModal2").hide();
  }

  showMessage = (interval, error, success, msg) => {
    clearTimeout(this.messageTimeout);
    this.setState({ error: error, success: success, message: msg });
    if (interval) {
      this.messageTimeout = setTimeout(() => {
        this.setState({ error: false, success: false, message: "" });
      }, 5000)
    }
  }

  componentWillUnmount() {
    clearTimeout(this.messageTimeout)
  }

  render() {
    const { error, message, series, error2, message2, success2 } = this.state;
    return (
      <div style={{ height: '70vh', padding: '30px' }}>
        <img src='/images/Vertiv_logo.png'
          alt="" className="vacus-logo" />
        {error && (
          <div
            style={{ marginTop: "20px", color: "red" }}>
            <strong>{message}</strong>
          </div>
        )}
        <div
          id="remove_btn"
          onClick={() => $("#graphModal2").show()}
          className="config con">
          <span>Configure IP</span>
        </div>
        <TableDetails />

        <div id="graphModal1" className="graph-modal">
          <div className="graph-modal-content">
            <h5 style={{ marginLeft: "20px" }}>History</h5>
            <div className="graph-modal-close">
              <span>
                <i className="far fa-times-circle"
                  onClick={() => {
                    $("#graphModal1").delay(200).fadeOut();
                  }}>
                </i>
              </span>
            </div>
            <div className="img-block">
              {series.length ? (
                <div id="chart-timeline">
                  <ApexCharts
                    options={{
                      chart: {
                        id: "area-datetime",
                        type: "area",
                        height: 380,
                        curve: "smooth",
                        zoom: {
                          autoScaleYaxis: true,
                        },
                        animations: {
                          enabled: true,
                          easing: "easeinout",
                          speed: 500,
                          animateGradually: {
                            enabled: true,
                            delay: 500,
                          },
                          dynamicAnimation: {
                            enabled: true,
                            speed: 500,
                          },
                        },
                      },
                      stroke: {
                        width: 2,
                      },
                      dataLabels: {
                        enabled: false,
                      },
                      markers: {
                        size: 0,
                      },
                      xaxis: {
                        type: "datetime",
                        tickAmount: 1,
                        labels: {
                          datetimeUTC: false,
                        },
                      },
                      yaxis: {
                        labels: {
                          formatter: function (val) {
                            return parseInt(val)
                          }
                        }
                      },
                      tooltip: {
                        x: {
                          format: "yyyy-MM-dd HH:mm:ss",
                        },
                      },
                      colors: ["#ff1a1a", "#1a1aff"],
                    }}
                    series={series}
                    type="area"
                    height={370} />
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div id="graphModal2" className="graph-modal">
          <div className="graph-modal-content">
            <h5 style={{ marginLeft: "20px" }}>Configuration</h5>
            <div className="graph-modal-close">
              <span>
                <i className="far fa-times-circle"
                  title="close"
                  onClick={() => this.closeConfig()}>
                </i>
              </span>
            </div>
            {error2 && (
              <div
                style={{ marginBottom: "20px", marginLeft: "20px", color: "red" }}>
                <strong>{message2}</strong>
              </div>
            )}
            {success2 && (
              <div
                style={{ marginBottom: "20px", marginLeft: "20px", color: "green" }}>
                <strong>{message2}</strong>
              </div>
            )}

            <div style={{ marginLeft: "25px" }}>
              <div className="inputdiv" style={{ display: "flex", alignItems: "center" }}>
                <span className="label">Interface </span>
                <input type="text" name="interface" id="interface"
                  placeholder="eth0/wlan"
                  required="required" />
              </div>
              <div className="inputdiv">
                <span className="label">Static IP
                  <span style={{ fontSize: "10px" }}>(ip/subnet)</span> </span>
                <input type="text" name="static_ip"
                  placeholder="000.000.000.000/24"
                  id="static_ip" required="required" />
              </div>
              <div className="inputdiv">
                <span className="label">Gateway IP </span>
                <input type="text" name="static_router"
                  placeholder="000.000.000.000"
                  id="static_router" required="required" />
              </div>
              <div className="inputdiv">
                <span className="label">Domain Name </span>
                <input type="text" name="domainName"
                  placeholder="000.000.000.000"
                  id="domainName" required="required" />
              </div>
            </div>
            <div>
              <div className="btn-submit"
                onClick={() => this.submitBtn()}>
                Submit
              </div>
            </div>
          </div>
        </div>

        <div id="displayModal3" className="modal">
          <div className="modal-content" >
            <div className='modalheader'>
              <span style={{
                color: 'white', fontWeight: 600,
                paddingTop: '5px', fontSize: '20px'
              }}>Attention!!!</span>
            </div>
            <div style={{ display: 'flex' }}>
              <div className='modaltext'>
                <span style={{ display: 'inline-block', fontWeight: 500, marginTop: '6px' }}>Are You Sure To Reboot The System??</span>
                <button style={{ textAlign: "center", marginTop: '30px', marginLeft: '31px' }}
                  id="cancel"
                  onClick={() => $("#displayModal3").css("display", "none")}
                  className="btn-center btn danger-btn"
                >
                  Cancel
                </button>

                <button style={{ textAlign: "center", marginTop: '30px', marginLeft: '10px' }}
                  id="ok"
                  onClick={() => {
                    $("#graphModal2").hide();
                    $("#displayModal3").css("display", "none");
                  }}
                  className="btn-center btn success-btn"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}