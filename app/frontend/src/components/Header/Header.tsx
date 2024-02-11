import React from "react";
import Menu from "./Menu";

export default function Header() {
    return (
        <div>
            <div className="header-wrapper header-wrapper--bg">
                <div className="header-nav-wrapper">
                    <header>
                        <div className="">
                            <div id="clean-header-section" className="clean-header-container">
                                <div className="mobile-only mobile-navigation-hamburger-nav-container">
                                    <a
                                        aria-expanded="false"
                                        role="button" // tabindex="0"
                                    >
                                        <img
                                            className="mobile-navigation-hamburger-nav"
                                            alt="Navigation Menu"
                                            src="data:image/svg+xml;base64,PHN2ZyBpZD0iaGFtYnVyZ2VyIiBkYXRhLW5hbWU9ImhhbWJ1cmdlciIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgOTcgNzEuNDMiPgoJPHRpdGxlPkhhbWJ1cmdlcjwvdGl0bGU+Cgk8cmVjdCB3aWR0aD0iOTciIGhlaWdodD0iMTQuNDkiLz4KCTxyZWN0IHg9IjAuMDIiIHk9IjI4LjQ3IiB3aWR0aD0iOTYuOTYiIGhlaWdodD0iMTQuNDkiLz4KCTxyZWN0IHg9IjAuMDIiIHk9IjU2LjkzIiB3aWR0aD0iOTYuOTYiIGhlaWdodD0iMTQuNDkiLz4KPC9zdmc+"
                                        />
                                    </a>
                                </div>
                                <div className="clean-header-section__global-nav desktop-tablet-only">
                                    <div className="clean-header-left-top">
                                        <ul className="gender-nav-container">
                                            <li>
                                                <button
                                                    className="active"
                                                    role="Women"
                                                    data-gender="W"
                                                    aria-label="WOMEN" //tabindex="0"
                                                >
                                                    Women
                                                </button>
                                            </li>
                                            <li>
                                                <button
                                                    className=""
                                                    role="Men"
                                                    data-gender="M"
                                                    aria-label="MEN" //tabindex="0"
                                                >
                                                    <a href="https://www.neimanmarcus.com/mens">Men</a>
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                                <span className="brand-logo-clean-header">
                                    <div className="header-brand-site-logo-container">
                                        <a className="header-brand-site-logo-container__link" href="https://www.neimanmarcus.com">
                                            <img
                                                className="header-brand-site-logo-container__site-logo false"
                                                src="https://www.neimanmarcus.com/c/assets/images/neiman-marcus-logo-full-width.9aa925b08380615243af7abc5ed63919.svg"
                                            />
                                        </a>
                                    </div>
                                </span>
                                <div className="clean-header-section__right-aligned">
                                    <div className="clean-header-utility-menu">
                                        <div className="your-neimans-cta-main">
                                            <a className="your-neimans-cta" href="https://www.neimanmarcus.com/login">
                                                Sign In
                                            </a>
                                        </div>
                                        <div className="favorite">
                                            <a href="https://www.neimanmarcus.com/favoriteitems">
                                                <img
                                                    alt="my favorite icon"
                                                    src="data:image/svg+xml;base64,PHN2ZyBpZD0iZmF2b3JpdGVzX3NlbGVjdGVkIiBkYXRhLW5hbWU9ImZhdm9yaXRlc19zZWxlY3RlZCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgODIuMzMgNzcuMjUiPgoJPHRpdGxlPkZhdm9yaXRlcyBTZWxlY3RlZDwvdGl0bGU+Cgk8cGF0aCBkPSJNNzkuNjcsMTIuMjFTNzMsMC4zOCw2MCwuMzhBMjEuNDIsMjEuNDIsMCwwLDAsNDEuNSwxMC43MSwyMS40MiwyMS40MiwwLDAsMCwyMywuMzhDMTAsMC4zOCwzLjMzLDEyLjIxLDMuMzMsMTIuMjFzLTYuNzUsOS4wOCwwLDIyLjI1UzM0LjQyLDcxLjIxLDQxLjUsNzcuNjNjNy4wOC02LjQyLDMxLjQyLTMwLDM4LjE3LTQzLjE3Uzc5LjY3LDEyLjIxLDc5LjY3LDEyLjIxWiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTAuMzMgLTAuMzgpIi8+Cjwvc3ZnPgo="
                                                    className="favo-icon"
                                                />
                                            </a>
                                        </div>
                                        <div className="miniCartContainer">
                                            <span id="miniCartContainer" className="miniCart-desktop-container desktop-tablet-only">
                                                <button id="miniCartButton" aria-expanded="false" className="shopping-link icon-shopping-bag">
                                                    Shopping Bag
                                                </button>
                                                <div className="miniCartOverlay"></div>
                                            </span>
                                            <div className="mobile-only mobile-header-shopping-bag-icon-container">
                                                <a
                                                    id="miniCartButtonMobile"
                                                    href="https://www.neimanmarcus.com/checkout/cart.jsp?perCatId=&amp;catqo=&amp;co=true"
                                                    role="button"
                                                >
                                                    <img className="mobile-header-shopping-bag-icon" src="" alt="Shopping Bag containing 0 items" />
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="header-search-box-container desktop-tablet-only">
                                        <form className="search-box" method="GET">
                                            <table className="input-and-button">
                                                <tbody>
                                                    <tr>
                                                        <th>
                                                            <input type="hidden" title="from-input" name="from" value="brSearch" />
                                                            <input type="hidden" title="l-input" name="l" value="" />
                                                            <input
                                                                type="text"
                                                                title="search box"
                                                                autoComplete="off"
                                                                id="brSearchInput"
                                                                name="q"
                                                                className="search-box__text"
                                                                aria-label="Search Box"
                                                                placeholder="Search"
                                                                value=""
                                                            />
                                                            <input type="hidden" id="searchEnterType" value="bloomreach" />
                                                            <div className="make-relative br-search-static"></div>
                                                            <div className="recent-search-renderer suggestions-search-box"></div>
                                                        </th>
                                                        <th>
                                                            <input
                                                                type="submit"
                                                                title="submit button"
                                                                className="search-box__submit headerSearchButton"
                                                                style={{ transform: "translateY(-21px)" }}
                                                                value="search"
                                                            />
                                                        </th>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </form>
                                    </div>
                                </div>
                            </div>
                            <div className="">
                                <div className="mobile-only exposed-search-box-search-container" id="bloomreach-typeahead-container-mobile">
                                    <form
                                        action="https://www.neimanmarcus.com/s/"
                                        className="mobile-only exposed-search-box-mobile--visible-sticky"
                                        method="GET"
                                    >
                                        <input title="from-input" name="from" type="hidden" value="brSearch" />
                                        <input title="l-input" name="l" type="hidden" value="" />
                                        <input
                                            type="button"
                                            name="search-icon"
                                            title="search icon"
                                            aria-label="Get Results"
                                            className="exposed-search-box-mobile__search-icon"
                                        />
                                        <input
                                            title="search-term-input"
                                            placeholder="Search"
                                            autoComplete="off"
                                            autoCorrect="off"
                                            autoCapitalize="off"
                                            spellCheck="false"
                                            aria-label="Search Box"
                                            id="mobileBrSearchInput"
                                            name="q"
                                            className="exposed-search-box-mobile__text"
                                            value=""
                                        />
                                        <div className="brm-autosuggest-wrap-mobile">
                                            <div id="newBRTypeAhead"></div>
                                        </div>
                                        <input
                                            id="mobile-hidden-submit"
                                            type="submit"
                                            name="search-submit"
                                            title="search-submit"
                                            style={{ display: "none" }}
                                            value="search"
                                        />
                                    </form>
                                </div>
                            </div>
                        </div>
                    </header>
                    <Menu />
                </div>
            </div>
        </div>
    );
}
