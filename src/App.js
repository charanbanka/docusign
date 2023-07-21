import React, { useState, useEffect, useMemo } from "react";
import "./App.css";

function App() {
  const [emojisData, setEmojisData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filterOptions, setFilterOptions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState("all");
  const getEmojis = async () => {
    try {
      const resp = await fetch("https://emojihub.yurace.pro/api/all");
      const data = await resp.json();
      let res = data.reduce((acc, emoji) => {
        if (!acc.includes(emoji.category)) acc.push(emoji.category);
        return acc;
      }, []);
      setFilterOptions(res);
      setEmojisData(data);
      setDefaultFilteredData(data, 1);
    } catch (error) {
      console.log("Error while fetching emoji details:", error);
    }
  };

  useEffect(() => {
    getEmojis();
  }, []);

  const setDefaultFilteredData = (data, page_no) => {
    let pageSize = 10;
    const start = (page_no - 1) * pageSize;
    const end = start + pageSize;
    let filter_data = data.slice(start, end);
    setCurrentPage(page_no);
    setTotalPages(Math.ceil(data.length / 10));
    setFilteredData(filter_data);
  };

  function filterEmojisByCategory(category_) {
    setCategory(category_);
    let data = [];
    if (category_ === "all") {
      data = emojisData;
    } else {
      const filteredData = emojisData.filter(
        (emoji) => emoji.category === category_
      );

      data = filteredData;
    }
    setDefaultFilteredData(data, 1);
  }

  const EmojiByUnicode = (unicode) => {
    const emoji = String.fromCodePoint(parseInt(unicode.replace("U+", ""), 16));
    return <span>{emoji}</span>;
  };
  const EmojiHTMLCode = (htmlCode) => {
    return <span dangerouslySetInnerHTML={{ __html: htmlCode }} />;
  };

  let onGotoPage = (page_no) => {
    const pageSize = 10;
    const start = (page_no - 1) * pageSize;
    const end = start + pageSize;
    let data = [];
    if (category === "all") {
      data = emojisData;
    } else {
      const filteredData = emojisData.filter(
        (emoji) => emoji.category === category
      );

      data = filteredData;
    }
    setCurrentPage(page_no);
    setFilteredData(data.slice(start, end));
  };

  let getMiddlePages = useMemo(() => {
    let middlePages = [];
    let dotStr = false;
    middlePages.push(currentPage);
    if (currentPage == totalPages) {
      if (totalPages == 2) {
        middlePages.push(currentPage - 1);
      } else {
        middlePages.push(currentPage - 1);
        middlePages.push(currentPage - 2);
      }
      middlePages = middlePages.reverse();
    } else if (currentPage == totalPages - 1) {
      if (totalPages == 2) {
        middlePages.push(currentPage + 1);
      } else {
        middlePages = [];
        middlePages.push(currentPage - 1);
        middlePages.push(currentPage);
        middlePages.push(currentPage + 1);
      }
    } else {
      if (totalPages == 3) {
        middlePages.push(currentPage + 1);
        middlePages.push(currentPage + 2);
      } else {
        middlePages.push(currentPage + 1);
        middlePages.push(totalPages);
        if (currentPage + 2 != totalPages) dotStr = true;
      }
    }
    return { middlePages, dotStr };
  }, [totalPages, currentPage]);

  let { middlePages, dotStr } = getMiddlePages;
  const middleButtons = middlePages?.map((item, idx) => {
    return (
      <>
        {totalPages > 2 && dotStr && idx == 2 && (
          <li className="page-item" key={idx}>
            <a className="page-link">...</a>
          </li>
        )}
        <li className="page-item" key={idx + 1}>
          <a
            className={`page-link ${currentPage == item && "active"}`}
            onClick={() => onGotoPage(item)}
            href="#"
          >
            {item}
          </a>
        </li>
      </>
    );
  });
  const Pagination = () => {
    return (
      <nav aria-label="">
        <ul className="pagination">
          <li className={`page-item ${currentPage == 1 && "disabled"}`}>
            <a
              className="page-link"
              href="#"
              aria-label="Previous"
              onClick={() => onGotoPage(currentPage - 1)}
            >
              <span aria-hidden="true">&laquo;</span>
            </a>
          </li>
          {middleButtons}
          <li
            className={`page-item ${currentPage == totalPages && "disabled"}`}
          >
            <a
              className="page-link"
              href="#"
              aria-label="Next"
              onClick={() => onGotoPage(currentPage + 1)}
            >
              <span aria-hidden="true">&raquo;</span>
            </a>
          </li>
        </ul>
      </nav>
    );
  };

  return (
    <div className="d-flex flex-column align-items-center mt-2">
      <div className="mb-1">
        <label htmlFor="category" className="me-1">
          Filter by Category:
        </label>
        <select
          id="category"
          onChange={(e) => filterEmojisByCategory(e.target.value)}
          className="p-1"
        >
          <option value="all">All</option>
          {filterOptions.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
      <div className="d-flex flex-wrap justify-content-center">
        {filteredData.map((emoji) => (
          <div key={emoji.name} className="card">
            <p>Name: {emoji.name}</p>
            <p>Category: {emoji.category}</p>
            <p>Group: {emoji.group}</p>
            {emoji.unicode.map((code) => (
              <p key={code}>{EmojiByUnicode(code)}</p>
            ))}
          </div>
        ))}
      </div>
      {emojisData?.length > 10 && (
        <div className="pagination">
          <Pagination />
        </div>
      )}
    </div>
  );
}

export default App;
