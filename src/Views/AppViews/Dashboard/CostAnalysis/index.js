import React, { Component } from "react";
import { Box, List, ListItem } from "@mui/material";
import Grid from "@mui/material/Grid";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import {
  getProductWiseCost,
  getProductionVsOther,
  getServiceTypeWiseCost,
} from "Redux/Dashboard/DashboardThunk";
import { connect } from "react-redux";
import status from "Redux/Constants/CommonDS";
import { v4 } from "uuid";
import Loader from "Components/Loader";

ChartJS.register(ArcElement, Tooltip, Legend);

const colorPallate = [
  "#8676FF",
  "#42CD7E",
  "#FF9066",
  "#FFCC41",
  "#FF97AA",
  "#34A2C2",
  "#FB4B93",
  "#A04D4D",
  "#608E7D",
];

class CostAnalysis extends Component {
  constructor(props) {
    super(props);
    this.state = {
      productWiseCostData: [],
      productionVsOthersData: [],
      serviceTypeWiseCostData: [],
    };
  }

  componentDidMount = () => {
    this.props.getProductWiseCost();
    this.props.getProductionVsOther();
    this.props.getServiceTypeWiseCost();
  };

  componentDidUpdate = (prevProps, prevState) => {
    if (
      prevProps.productWiseCost.status !== this.props.productWiseCost.status &&
      this.props.productWiseCost.status === status.SUCCESS
    ) {
      this.setState({ productWiseCostData: this.props.productWiseCost.data });
    }

    if (
      prevProps.productionVsOther.status !==
        this.props.productionVsOther.status &&
      this.props.productionVsOther.status === status.SUCCESS
    ) {
      this.setState({
        productionVsOthersData: this.props.productionVsOther.data,
      });
    }

    if (
      prevProps.serviceTypeWiseCost.status !==
        this.props.serviceTypeWiseCost.status &&
      this.props.serviceTypeWiseCost.status === status.SUCCESS
    ) {
      this.setState({
        serviceTypeWiseCostData: this.props.serviceTypeWiseCost.data,
      });
    }
  };

  /** Gets API data and returns Dough chart acceptable data
   * @param {array} data - API data.
   */
  manipulateDoughData = (data) => {
    let doughData = {
      datasets: [
        {
          data: [],
          backgroundColor: [],
        },
      ],
    };
    data?.length &&
      data.map((item, index) => {
        if (index !== data.length - 1) {
          doughData.datasets[0].data.push(item.total);
          doughData.datasets[0].backgroundColor.push(colorPallate[index]);
        }
      });
    return doughData;
  };

  /** Gets API data and returns Bars JSX
   * @param {array} data - API data.
   */
  renderBarsData = (data) => {
    const JSX = [];
    data?.length &&
      data.map((item, index) => {
        if (index !== data.length - 1) {
          JSX.push(
            <ListItem key={v4()}>
              <p>{item.name}</p>
              <Box className="d-block right-contant">
                <label>${item.total?.toLocaleString()}</label>
                <span>
                  <span
                    style={{
                      width: `${item.percentage}%`,
                      background: `${colorPallate[index]}`,
                    }}
                  ></span>
                </span>
              </Box>
            </ListItem>
          );
        }
      });
    return JSX;
  };

  render() {
    const {
      productWiseCostData,
      productionVsOthersData,
      serviceTypeWiseCostData,
    } = this.state;
    return (
      <Box className="cost-analysis-container">
        <Box className="product-wise-inner-container">
          <Box className="main-collapse-expand">
            <Box sx={{ flexGrow: 1 }}>
              <Grid container spacing={3}>
                <Grid item lg={4} md={6} xs={12}>
                  <Box id="chart" className="collapse-expand">
                    {this.props.productWiseCost.status ===
                    status.IN_PROGRESS ? (
                      <Loader className="spend-loading" />
                    ) : (
                      <>
                        <Box className="heading">
                          <h3>Product Wise Cost</h3>
                          <Box className="product-cost">
                            {productWiseCostData &&
                            productWiseCostData.length ? (
                              <>
                                <label>
                                  $
                                  {productWiseCostData[
                                    productWiseCostData.length - 1
                                  ]?.total?.toLocaleString()}
                                </label>
                              </>
                            ) : (
                              <></>
                            )}
                            <span>10%</span>
                          </Box>
                        </Box>
                        <Box className="chart-contant">
                          <Box
                            className="d-flex chart"
                            style={{ width: "60%" }}
                          >
                            {productWiseCostData &&
                            productWiseCostData.length ? (
                              <Doughnut
                                data={this.manipulateDoughData(
                                  productWiseCostData
                                )}
                              />
                            ) : (
                              <></>
                            )}
                          </Box>
                          <Box className="d-block chart-details">
                            <List>
                              {this.renderBarsData(productWiseCostData)}
                            </List>
                          </Box>
                        </Box>
                      </>
                    )}
                  </Box>
                </Grid>
                <Grid item lg={4} md={6} xs={12}>
                  <Box id="chart" className="collapse-expand">
                    {this.props.productionVsOther.status ===
                    status.IN_PROGRESS ? (
                      <Loader className="spend-loading" />
                    ) : (
                      <>
                        <Box className="heading">
                          <h3>Production Vs Others</h3>
                          <Box className="product-cost">
                            {productionVsOthersData &&
                            productionVsOthersData.length ? (
                              <label>
                                $
                                {productionVsOthersData[
                                  productionVsOthersData.length - 1
                                ].total?.toLocaleString()}
                              </label>
                            ) : (
                              <></>
                            )}
                            <span>10%</span>
                          </Box>
                        </Box>
                        <Box className="chart-contant">
                          <Box
                            className="d-flex chart"
                            style={{ width: "60%" }}
                          >
                            <Doughnut
                              data={this.manipulateDoughData(
                                productionVsOthersData
                              )}
                            />
                          </Box>
                          <Box className="d-block chart-details">
                            <List>
                              {this.renderBarsData(productionVsOthersData)}
                            </List>
                          </Box>
                        </Box>
                      </>
                    )}
                  </Box>
                </Grid>
                <Grid item lg={4} md={6} xs={12}>
                  <Box id="chart" className="collapse-expand">
                    {this.props.serviceTypeWiseCost.status ===
                    status.IN_PROGRESS ? (
                      <Loader className="spend-loading" />
                    ) : (
                      <>
                        <Box className="heading">
                          <h3>Service Type Wise Cost </h3>
                          <Box className="product-cost">
                            {serviceTypeWiseCostData &&
                            serviceTypeWiseCostData.length ? (
                              <label>
                                $
                                {serviceTypeWiseCostData[
                                  serviceTypeWiseCostData.length - 1
                                ]?.total?.toLocaleString()}
                              </label>
                            ) : (
                              <></>
                            )}
                            <span>10%</span>
                          </Box>
                        </Box>
                        <Box className="chart-contant">
                          <Box
                            className="d-flex chart"
                            style={{ width: "60%" }}
                          >
                            <Doughnut
                              data={this.manipulateDoughData(
                                serviceTypeWiseCostData
                              )}
                            />
                          </Box>
                          <Box className="d-block chart-details">
                            <List>
                              {this.renderBarsData(serviceTypeWiseCostData)}
                            </List>
                          </Box>
                        </Box>
                      </>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }
}

const mapStateToProps = (state) => {
  const { productWiseCost, productionVsOther, serviceTypeWiseCost } =
    state.dashboard;
  return { productWiseCost, productionVsOther, serviceTypeWiseCost };
};

const mapDispatchToProps = {
  getProductWiseCost,
  getProductionVsOther,
  getServiceTypeWiseCost,
};

export default connect(mapStateToProps, mapDispatchToProps)(CostAnalysis);
