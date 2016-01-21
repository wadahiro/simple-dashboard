///<reference path="../react/react-0.13.3.d.ts"/>

declare module "react-select" {

    import React = require("react");


    interface SelectProps extends React.Props<Select> {
        [index: string]: any;
    }
    interface Select extends React.ReactElement<SelectProps> { }
    var Select: Select;
}