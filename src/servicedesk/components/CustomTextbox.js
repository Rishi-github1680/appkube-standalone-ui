import React from "react";

class CustomTextbox extends React.Component {
  constructor(props) {
    super(props);
  }
  onChange = (e) => {
    if (this.props.onChange) {
      this.props.onChange(e);
    }
  };
  render() {
    const {
      containerClass,
      labelClass,
      inputClass,
      label,
      htmlFor,
      id,
      name,
      placeholder,
      value,
      icon,
      isValid,
      message,
      type,
    } = this.props;
    return (
      <div className={containerClass}>
        <label className={labelClass} htmlFor={htmlFor}>
          {label}
        </label>
        {icon}
        <input
          type={type ? type : "text"}
          className={`${inputClass} ${isValid ? "" : "is-invalid"}`}
          id={id}
          name={name}
          value={value}
          placeholder={placeholder}
          onChange={this.onChange}
        />
        {!isValid && <div className="invalid-feedback">{message}</div>}
      </div>
    );
  }
}
export default CustomTextbox;
