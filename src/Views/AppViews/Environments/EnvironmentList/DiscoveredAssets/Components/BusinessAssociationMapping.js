import React, { Component } from "react";
import { ArcherContainer, ArcherElement } from "react-archer";
import { v4 } from "uuid";
import {
  getDepartments,
  getProductList,
  getProductEnv,
  getModules,
  getModuleElements,
} from "Redux/AssociateApp/AssociateAppThunk";
import { getCurrentOrgId } from "Utils";
import status from "Redux/Constants/CommonDS";
import { connect } from "react-redux";
import calendarMouseIcon from "assets/img/assetmanager/calendar-mouse-icon.png";
import chartLogo from "assets/img/assetmanager/chart-logo.png";
import Box from "@mui/material/Box";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import { styled } from "@mui/material/styles";
import Loader from "Components/Loader";

const orgId = getCurrentOrgId();

let drawArrow = {
  targetId: "",
  targetAnchor: "left",
  sourceAnchor: "right",
  style: {
    strokeColor: "#d8d8ed",
    strokeWidth: 2,
    endShape: {
      circle: {
        radius: 1.3,
        fillColor: "#6a6a9f",
        strokeColor: "#6a6a9f",
        strokeWidth: -1.2,
      },
    },
  },
};

const productCategory = {
  "3 Tier": ["Web Layer", "App Layer", "Data Layer", "Auxilary Layer"],
  SOA: ["BUSINESS", "COMMON"],
};
let transformScale = 0;

const HtmlTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} arrow classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.arrow}`]: {
    color: "#ffffffff",
  },
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "#ffffffff",
    color: "rgba(0, 0, 0, 0.87)",
    maxWidth: 200,
    fontSize: theme.typography.pxToRem(12),
    border: "1px solid #dadde9",
  },
}));
let handleSetTransform = () => {};

let chartContainer = document.getElementsByClassName("chart-container");
let transformContainer = document.getElementsByClassName(
  "react-transform-component"
);
class BusinessAssociationMapping extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeLevels: {},
      levelsData: [],
      productType: "",
      serviceName: "",
      positionX: "",
      positionY: "",
      lastPositionX: "",
      lastLevelsWidth: 0,
    };
  }

  componentDidMount = () => {
    this.props.getDepartments(orgId);
  };

  componentDidUpdate(prevProps, prevState) {
    if (
      prevProps.departments.status !== this.props.departments.status &&
      this.props.departments.status === status.SUCCESS &&
      this.props.departments?.data?.length
    ) {
      let { activeLevels, levelsData, productType } = this.state;
      const initailDepartment = this.props.departments.data;
      this.setState({
        departments: initailDepartment,
        serviceName: initailDepartment[0]?.name,
      });
      this.props.setBreadCrumbs(
        activeLevels,
        levelsData,
        initailDepartment[0]?.name,
        productType
      );
    }

    if (
      prevProps.products.status !== this.props.products.status &&
      this.props.products.status === status.SUCCESS &&
      this.props.products?.data
    ) {
      let { levelsData, activeLevels, serviceName, productType } = this.state;
      let products = this.props.products?.data;

      levelsData.length = 1;

      if (products.length) {
        levelsData.push(
          products.map((product) => {
            let { name: label, id } = product;
            return {
              label,
              id,
              image: calendarMouseIcon,
              type: "Product",
              productType: product.type,
            };
          })
        );
      }

      this.setStateOrProps(activeLevels, levelsData, serviceName, productType);
    }

    if (
      prevProps.productEnv.status !== this.props.productEnv.status &&
      this.props.productEnv.status === status.SUCCESS &&
      this.props.productEnv?.data
    ) {
      let { levelsData, activeLevels, productType, serviceName } = this.state;
      let productEnvs = this.props.productEnv.data;

      levelsData.length = 2;

      if (productEnvs?.length) {
        levelsData.push(
          productEnvs.map((env) => {
            let { name: label, id } = env;
            return {
              label,
              id,
              image: calendarMouseIcon,
              type: "ProductEnv",
              productType,
            };
          })
        );
      }

      this.setStateOrProps(activeLevels, levelsData, serviceName, productType);
    }

    if (
      prevProps.modules.status !== this.props.modules.status &&
      this.props.modules.status === status.SUCCESS &&
      this.props.modules.data
    ) {
      let { levelsData, activeLevels, serviceName, productType } = this.state;

      let modules = this.props.modules.data;

      levelsData.length = 4;

      if (modules?.length) {
        levelsData[4] = modules.map((module) => {
          let { name: label, id } = module;
          return {
            label,
            id,
            image: calendarMouseIcon,
            type: "Module",
          };
        });
      }

      this.setStateOrProps(activeLevels, levelsData, serviceName, productType);
    }

    if (
      prevProps.moduleElements.status !== this.props.moduleElements.status &&
      this.props.moduleElements.status === status.SUCCESS &&
      this.props.moduleElements.data
    ) {
      let { levelsData, activeLevels, serviceName, productType } = this.state;
      let moduleElements = this.props.moduleElements.data;

      levelsData.length = 5;

      if (moduleElements?.length) {
        levelsData[5] = moduleElements.map((module) => {
          let { serviceName: label, id } = module;
          return {
            label,
            id,
            image: calendarMouseIcon,
            type: "ModuleElement",
          };
        });
      }

      this.setStateOrProps(activeLevels, levelsData, serviceName, productType);
    }

    if (
      prevProps.clickBreadCrumbDetails?.breadcrumbId !==
      this.props.clickBreadCrumbDetails?.breadcrumbId
    ) {
      let { selectedLevel, currentLevelIndex, label, type, productType } =
        this.props.clickBreadCrumbDetails;

      if (type) {
        this[`onClick${type}`](
          {
            selectedLevel,
            currentLevelIndex,
            label,
            type,
            productType,
          },
          1
        );
      }
    }

    if (prevProps.resetBreadCrumbId !== this.props.resetBreadCrumbId) {
      let { activeLevels, levelsData, serviceName, productType } = this.state;
      activeLevels = {};
      levelsData = [];
      this.setStateOrProps(activeLevels, levelsData, serviceName, productType);
    }
  }

  /**
   * BAM = Business Association Mapping
   * Render the main body including all levels data.
   */
  renderBody = () => {
    let { activeLevels, departments, levelsData, positionX } = this.state;

    let departmentLength =
      departments?.length && departments[0].departments?.length;

    const {
      departments: organization,
      products,
      productEnv,
      modules,
      moduleElements,
    } = this.props;

    const inprogressStatus = status.IN_PROGRESS;

    const lodingData = [
      products.status,
      productEnv.status,
      modules.status,
      moduleElements.status,
    ].includes(inprogressStatus);

    if (organization.status === inprogressStatus) {
      return this.renderLoder("h-100");
    } else {
      return departmentLength ? (
        <ArcherContainer className="chart-container" startMarker>
          <TransformWrapper
            wrapperStyle={{
              width: "100%",
            }}
            onTransformed={(instance) => {
              transformScale = instance && instance.state.scale;
              let { positionX, positionY } = instance.state;
              this.setState({ scale: true, positionX, positionY });
            }}
            minScale={0.3}
            limitToBounds={false}
          >
            {({
              zoomIn,
              zoomOut,
              instance,
              zoomToElement,
              setTransform,
              ...rest
            }) => {
              transformScale = instance.transformState.scale;
              handleSetTransform = setTransform;

              return (
                <>
                  <TransformComponent
                    contentStyle={{
                      alignItems: "center",
                      width: "2000px",
                    }}
                  >
                    <ArcherElement
                      id="root"
                      relations={this.onClickLevelsThenDrawLine()}
                    >
                      <div
                        className={`chart-box ${
                          levelsData[0]?.length ? "active" : ""
                        }`}
                        onClick={() => {
                          this.onClickSynectiks();
                        }}
                        id={`${
                          Object.keys(activeLevels).length === 0
                            ? "lastNodeActive"
                            : ""
                        }`}
                      >
                        <img src={chartLogo} alt="Logo" />
                      </div>
                    </ArcherElement>
                    {this.renderChildBody()}
                    {lodingData ? this.renderLoder() : <></>}
                  </TransformComponent>
                  <div className="gmnoprint">
                    <div className="gmnoprint-plus-minus">
                      <button className="btn btn-plus" onClick={() => zoomIn()}>
                        <i className="fa-solid fa-plus"></i>
                      </button>
                      <button
                        className="btn btn-minus"
                        onClick={() => zoomOut()}
                      >
                        <i className="fa-solid fa-minus"></i>
                      </button>
                    </div>
                    <div
                      className="gmnoprint-map"
                      onClick={() => {
                        zoomToElement("lastNodeActive", transformScale);
                      }}
                    >
                      <button className="btn btn-map">
                        <i className="fa-solid fa-map-marker-alt"></i>
                      </button>
                    </div>
                  </div>
                </>
              );
            }}
          </TransformWrapper>
        </ArcherContainer>
      ) : (
        ""
      );
    }
  };

  /**
   * Render specific level
   *  @param {Array} data - The data of the selected level.
   * @param {Number} selectedLevel - SelectedLevel.
   *
   */
  renderChildNodes = (data, selectedLevel) => {
    let { activeLevels, levelsData } = this.state;

    if (data.length) {
      return data.map((level, currentLevelIndex) => {
        let currentLevel = `selectedLevel_${selectedLevel}`;
        let elementId = `${currentLevel}_${level.id}`;

        let isActive = activeLevels[currentLevel]?.id === level.id;

        let relationsData = isActive
          ? this.onClickLevelsThenDrawLine(selectedLevel)
          : [];

        let activeNodeLength = Object.keys(activeLevels).length - 1;

        return (
          <ArcherElement id={elementId} relations={relationsData} key={v4()}>
            <li
              className={`${isActive ? "active" : ""}`}
              onClick={() =>
                level.type ? (
                  this[`onClick${level.type}`]({
                    selectedLevel,
                    currentLevelIndex: level.id,
                    label: level.label,
                    type: level.type,
                    productType: level.productType || "",
                  })
                ) : (
                  <></>
                )
              }
              key={v4()}
              id={`${
                isActive && activeNodeLength === selectedLevel
                  ? "lastNodeActive"
                  : ""
              }`}
            >
              <HtmlTooltip className="table-tooltip" title={level.label}>
                <Box className="tooltip-content">
                  <span>
                    <img src={level.image} alt={level.label} />
                  </span>
                  <div className="content">
                    <p>{level.label}</p>

                    {level.type === "Product" ? (
                      <div
                        className={`box ${
                          level.productType === "SOA" ? "orange" : "blue"
                        }`}
                      >
                        {level.productType}
                      </div>
                    ) : (
                      <></>
                    )}
                  </div>
                </Box>
              </HtmlTooltip>
              {isActive &&
              // level.children.length === 0 &&
              levelsData.length === selectedLevel + 1 ? (
                <i className="fa-solid fa-circle-plus"></i>
              ) : (
                <></>
              )}
            </li>
          </ArcherElement>
        );
      });
    }
  };

  /** Render All BAM Levels
   * BAM = Business Association Mapping
   */
  renderChildBody = () => {
    const { levelsData } = this.state;
    if (levelsData.length) {
      return levelsData.map((levelData, selectedLevel) => {
        if (levelData.length) {
          return (
            <div
              className={`global-servies`}
              style={{ width: "160px" }}
              key={v4()}
            >
              <ul>{this.renderChildNodes(levelData, selectedLevel)}</ul>
            </div>
          );
        }
      });
    }
  };

  /**
   * Fired event on click synectiks, then get departments
   */
  onClickSynectiks() {
    let { activeLevels, levelsData, departments, serviceName } = this.state;
    activeLevels = {};

    if (!levelsData.length) {
      levelsData = [
        departments[0]?.departments.map((department, index) => {
          let { name: label, id } = department;
          return { label, id, image: calendarMouseIcon, type: "Department" };
        }),
      ];
    } else {
      levelsData = [];
    }

    this.setStateOrProps(activeLevels, levelsData, serviceName, 0);
  }

  /**
   * Fired event on click Department, then get products
   *  @param {Object} data - get departmentId, selectedLevel and label
   *  @param {Boolean} isClickBreadCrumb - 1 if it is click on breadcrumb else 0
   */
  onClickDepartment(data, isClickBreadCrumb = 0) {
    let {
      currentLevelIndex: departmentId,
      selectedLevel,
      label,
      type,
      productType,
    } = data;

    let { activeLevels, levelsData, serviceName } = this.state;
    let activeBAMLevel = activeLevels[`selectedLevel_0`];

    levelsData.length = isClickBreadCrumb
      ? selectedLevel + 2
      : selectedLevel + 1;

    if (activeBAMLevel && activeBAMLevel?.id === departmentId) {
      if (isClickBreadCrumb) {
        activeLevels = { selectedLevel_0: activeBAMLevel };
      } else {
        activeLevels = {};
      }
    } else {
      activeLevels = {
        selectedLevel_0: {
          id: departmentId,
          label,
          type,
          productType,
        },
      };
      this.props.getProductList(departmentId);
    }

    this.setStateOrProps(activeLevels, levelsData, serviceName);
  }

  /**
   * Fired event on click product, then get product envs
   *  @param {Object} data - get productId, selectedLevel,productType and label
   *  @param {Boolean} isClickBreadCrumb - 1 if it is click on breadcrumb else 0
   */
  onClickProduct(data, isClickBreadCrumb = 0) {
    let {
      currentLevelIndex: productId,
      selectedLevel,
      label,
      type,
      productType,
    } = data;
    let { activeLevels, levelsData, serviceName } = this.state;

    let activeBAMLevel = activeLevels[`selectedLevel_1`];

    levelsData.length = isClickBreadCrumb
      ? selectedLevel + 2
      : selectedLevel + 1;
    activeLevels = this.getPreviousSelectedLevels(isClickBreadCrumb ? 1 : 0);

    if (activeBAMLevel && activeBAMLevel?.id === productId) {
      productType = "";
      this.props.setBreadCrumbs(
        activeLevels,
        levelsData,
        serviceName,
        productType
      );
    } else {
      activeLevels["selectedLevel_1"] = {
        id: productId,
        label,
        type,
      };
      this.props.getProductEnv(productId);
    }

    this.setState({
      levelsData,
      activeLevels,
      productType,
    });
  }

  /**
   * Fired event on click product envs, then get product category
   *  @param {Object} data - get envId, selectedLevel and label
   *  @param {Boolean} isClickBreadCrumb - 1 if it is click on breadcrumb else 0
   */
  onClickProductEnv(data, isClickBreadCrumb = 0) {
    let {
      productType,
      currentLevelIndex: envId,
      label,
      selectedLevel,
      type,
    } = data;
    let { levelsData, activeLevels, serviceName } = this.state;
    let activeBAMLevel = activeLevels[`selectedLevel_2`];

    levelsData.length = isClickBreadCrumb ? 4 : 3;
    activeLevels = this.getPreviousSelectedLevels(isClickBreadCrumb ? 2 : 1);

    if (activeBAMLevel && activeBAMLevel?.id === envId) {
    } else {
      levelsData[selectedLevel + 1] = productCategory[productType]
        ? productCategory[productType].map((name, index) => {
            return {
              label: name,
              id: index,
              image: calendarMouseIcon,
              type: "Category",
              productCategory: productType,
            };
          })
        : [];

      activeLevels["selectedLevel_2"] = {
        id: envId,
        label,
        type,
        productType,
      };
    }

    this.setStateOrProps(activeLevels, levelsData, serviceName);
  }

  /**
   * Fired event on click category, then get modules
   *  @param {Object} data - get envId, selectedLevel and label
   *  @param {Boolean} isClickBreadCrumb - 1 if it is click on breadcrumb else 0
   */
  onClickCategory(data, isClickBreadCrumb = 0) {
    let { currentLevelIndex: categoryId, label, type, productType } = data;
    let {
      levelsData,
      activeLevels,
      serviceName,
      productType: selectedType,
    } = this.state;

    let activeBAMLevel = activeLevels[`selectedLevel_3`];
    let { selectedLevel_0, selectedLevel_1, selectedLevel_2 } = activeLevels;

    levelsData.length = isClickBreadCrumb ? 5 : 4;
    activeLevels = this.getPreviousSelectedLevels(isClickBreadCrumb ? 3 : 2);

    if (activeBAMLevel && activeBAMLevel?.id === categoryId) {
    } else {
      if (selectedType === "SOA") {
        this.props.getModules({
          departmentId: selectedLevel_0.id,
          productId: selectedLevel_1.id,
          productEnvId: selectedLevel_2.id,
          serviceNature: label?.toLowerCase(),
        });
      }
      activeLevels["selectedLevel_3"] = {
        id: categoryId,
        label,
        type,
        productType,
      };
    }

    this.setStateOrProps(activeLevels, levelsData, serviceName, 0);
  }

  /**
   * Fired event on click category, then get modules
   *  @param {Object} data - get moduleId, selectedLevel and label
   *  @param {Boolean} isClickBreadCrumb - 1 if it is click on breadcrumb else 0
   */
  onClickModule(data, isClickBreadCrumb = 0) {
    let { currentLevelIndex: moduleId, label, type } = data;
    let { levelsData, activeLevels, serviceName, productType } = this.state;

    let activeBAMLevel = activeLevels[`selectedLevel_4`];
    let { selectedLevel_0, selectedLevel_1, selectedLevel_2, selectedLevel_3 } =
      activeLevels;

    activeLevels = this.getPreviousSelectedLevels(isClickBreadCrumb ? 4 : 3);
    levelsData.length = isClickBreadCrumb ? 6 : 5;

    if (activeBAMLevel && activeBAMLevel?.id === moduleId) {
    } else {
      if (productType === "SOA") {
        this.props.getModuleElements({
          departmentId: selectedLevel_0.id,
          productId: selectedLevel_1.id,
          productEnvId: selectedLevel_2.id,
          moduleId,
          serviceNature: selectedLevel_3.label?.toLowerCase(),
        });
      }

      activeLevels["selectedLevel_4"] = {
        id: moduleId,
        label,
        type,
      };
    }

    this.setStateOrProps(activeLevels, levelsData, serviceName, 0);
  }

  /**
   * Fired event on click ModuleElement
   *  @param {Object} data - get moduleId, selectedLevel and label
   *  @param {Boolean} isClickBreadCrumb - 1 if it is click on breadcrumb else 0
   */
  onClickModuleElement(data, isClickBreadCrumb = 0) {
    let { currentLevelIndex: moduleId, label, type } = data;
    let { levelsData, activeLevels, serviceName } = this.state;

    let activeBAMLevel = activeLevels[`selectedLevel_5`];
    activeLevels = this.getPreviousSelectedLevels(isClickBreadCrumb ? 5 : 4);

    if (activeBAMLevel && activeBAMLevel?.id === moduleId) {
      levelsData.length = isClickBreadCrumb ? 7 : 6;
    } else {
      activeLevels["selectedLevel_5"] = {
        id: moduleId,
        label,
        type,
      };
    }

    this.setStateOrProps(activeLevels, levelsData, serviceName, 0);
  }

  /** Fire click event then draw
   *  @param {Number} selectedLevel- The selectedLevel of BAM,
   */
  onClickLevelsThenDrawLine = (selectedLevel) => {
    let { levelsData, activeLevels } = this.state;
    let selectedLevelIndex = selectedLevel >= 0 ? selectedLevel + 1 : 0;
    let activeBAMKeys = Object.keys(activeLevels);

    if (levelsData.length && levelsData[selectedLevelIndex]) {
      return levelsData[selectedLevelIndex].map((item, index) => {
        let tempDrawArrow = JSON.parse(JSON.stringify(drawArrow));
        let currentId = `selectedLevel_${selectedLevelIndex}`;

        tempDrawArrow["targetId"] = `${currentId}_${item.id}`;

        let activeIndex = activeBAMKeys.indexOf(currentId);

        if (activeIndex >= 0) {
          let currentLevelIndex = activeLevels[activeBAMKeys[activeIndex]]?.id;

          if (currentLevelIndex === item.id) {
            tempDrawArrow["style"]["strokeColor"] = "#53ca43";
            tempDrawArrow["style"]["endShape"]["circle"]["strokeColor"] =
              "#53ca43";
            tempDrawArrow["style"]["endShape"]["circle"]["fillColor"] =
              "#53ca43";
            tempDrawArrow["order"] = 1;
          }
        }
        return tempDrawArrow;
      });
    } else {
      return [];
    }
  };

  /** Set State or Props
   *  @param {Object} activeLevels- The active levels of BAM
   *  @param {Array} levelsData- Levels data of BAM
   *  @param {string} serviceName- service name of BAM
   */
  setStateOrProps(activeLevels, levelsData, serviceName, isMoveToLeftSide = 1) {
    let { productType } = this.state;
    this.props.setBreadCrumbs(
      activeLevels,
      levelsData,
      serviceName,
      productType
    );
    this.setState({ levelsData, activeLevels, serviceName }, () => {
      if (isMoveToLeftSide) {
        this.levelsMoveToLeftSide();
      }
    });
  }

  /** get Previous levels
   *  @param {Number} level- number of level
   */
  getPreviousSelectedLevels(level) {
    let totalLevels = [0, 1, 2, 3, 4, 5];

    const { activeLevels } = this.state;
    let activeLevel = {};

    totalLevels.slice(0, level + 1).forEach((levelNumber) => {
      let key = `selectedLevel_${levelNumber}`;
      activeLevel = { ...activeLevel, [key]: activeLevels[key] };
    });

    return activeLevel;
  }

  // Move levels left side
  levelsMoveToLeftSide() {
    let {
      positionX,
      positionY,
      lastLevelsWidth,
      lastPositionX,
      positionXDifferce,
    } = this.state;

    let chartWidth = chartContainer[0].offsetWidth;
    let levelsWidth = transformContainer[0].offsetWidth;
    console.log(chartWidth, levelsWidth, positionX);
    if (chartWidth < levelsWidth) {
      //  || positionX !== lastPositionX - 20
      positionX = positionX - 230 * transformScale;
      let tempPositionXDiff = positionX - lastPositionX - 230 * transformScale;

      if (
        levelsWidth > lastLevelsWidth ||
        tempPositionXDiff !== positionXDifferce
      ) {
        handleSetTransform(positionX, positionY, transformScale);
        this.setState({
          lastLevelsWidth: levelsWidth,
          lastPositionX: positionX,
          positionXDifferce: tempPositionXDiff,
        });
      }
    }
  }
  // Render Loder
  renderLoder(widthClass) {
    return (
      <Loader className={`d-flex align-items-center ${widthClass} loading`} />
    );
  }

  render() {
    return this.renderBody();
  }
}

function mapStateToProps(state) {
  const { departments, products, productEnv, modules, moduleElements } =
    state.associateApp;
  return {
    departments,
    products,
    productEnv,
    modules,
    moduleElements,
  };
}

const mapDispatchToProps = {
  getDepartments,
  getProductList,
  getProductEnv,
  getModules,
  getModuleElements,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BusinessAssociationMapping);
