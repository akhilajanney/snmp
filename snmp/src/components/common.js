import React from "react";
import $ from "jquery";

export function getPagination(this_key, table) {
    var lastPage = 1;
    var self = this_key;
    $("#maxRows").on("change", function () {
        lastPage = 1;
        $("#prev").css({ background: "#686868", color: "#FFF" });
        $("#prev1").css({ background: "#686868", color: "#FFF" });
        var trnum = 0;
        var maxRows = parseInt($(this).val());
        if (maxRows === 5000) {
            $(".pagination").hide();
        } else {
            $(".pagination").show();
        }
        $(table + " tr:gt(0)").each(function () {
            trnum++;
            if (trnum > maxRows) {
                $(this).hide();
            }
            if (trnum <= maxRows) {
                $(this).show();
            }
        });
        var tableCount = $(table + " tbody tr").length;
        if (tableCount > maxRows) {
            $("#prev").css({ background: "#006287", color: "#FFF" });
        } else {
            $(".pagination").hide();
        }
        $('.pagination [data-page="1"]').addClass("active");
        $(".pagination .moving").on("click", function (evt) {
            clearInterval(self.interval);
            clearTimeout(self.timeout);
            clearInterval(self.interval1);
            console.log("====moving=====>");
            self.timeout = setTimeout(() => {
                self.getTableDetails("repeat");
                self.interval1 = setInterval(() => {
                    self.getTableDetails("repeat");
                }, 15 * 1000)
            }, 35 * 1000);
            evt.stopImmediatePropagation();
            evt.preventDefault();
            var pageNum = $(this).attr("data-page");
            var maxRows = parseInt($("#maxRows").val());
            var rowCount = $(table + " tbody tr").length;
            if (pageNum === "prev") {
                if (lastPage === 1) {
                    return;
                }
                pageNum = --lastPage;
            }

            let nxtCheck = 0;
            if (rowCount % maxRows === 0) {
                nxtCheck = parseInt(rowCount / maxRows);
            } else {
                nxtCheck = parseInt(rowCount / maxRows) + 1;
            }
            if (pageNum === "next") {

                if (lastPage === nxtCheck) {
                    return;
                }
                pageNum = lastPage + 1;
            }
            lastPage = pageNum;
            if (lastPage === nxtCheck) {
                $("#prev1").css({ background: "#006287", color: "#FFF" });
                $("#prev").css({ background: "#686868", color: "#FFF" });
            } else if (lastPage === 1) {
                $("#prev").css({ background: "#006287", color: "#FFF" });
                $("#prev1").css({ background: "#686868", color: "#FFF" });
            } else {
                $("#prev").css({ background: "#006287", color: "#FFF" });
                $("#prev1").css({ background: "#006287", color: "#FFF" });
            }
            var trIndex = 0;
            $(".pagination .moving").removeClass("active");
            $('.pagination [data-page="' + lastPage + '"]').addClass("active");
            $(table + " tr:gt(0)").each(function () {
                trIndex++;
                if (
                    trIndex > maxRows * pageNum ||
                    trIndex <= maxRows * pageNum - maxRows
                ) {
                    $(this).hide();
                } else {
                    $(this).show();
                }
            });
        });
    })
        .val(25)
        .change();
}


export function TableDetails() {
    return (
        <div id="common_table" style={{ paddingBottom: "100px" }}>
            <div className="table_det">
                <div
                    id="rangeDropdown"
                    style={{
                        float: "right",
                        position: "relative",
                        right: "1%",
                        marginBottom: "20px",
                        // marginTop: "-3%",
                    }}>
                    <select name="state" style={{ width: "140px" }} id="maxRows">
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="75">75</option>
                        <option value="100">100</option>
                    </select>
                </div>
                <table style={{ width: "100%", position: "relative" }} id="table_det">
                    <thead></thead>
                    <tbody></tbody>
                </table>
            </div>
            <div className="pagination">
                <button
                    id="prev1"
                    className="moving"
                    data-page="prev"
                    style={{ marginRight: "30px" }}>
                    Prev
                </button>
                <button className="moving" data-page="next" id="prev">
                    Next
                </button>
            </div>
        </div>
    )
}

