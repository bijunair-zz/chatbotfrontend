import React from "react";

export default function PromoBanner() {
    return (
        <div className="promo-header-wrapper promo-wide-header bg-promo-header-wpr" data-slot="RWDHeaderPromo">
            <div className="promo-header siteTicker " id="promo-header">
                <div className="promo-text desktop-promo-text siteTicker0" style={{ display: "none" }}>
                    <p>
                        <a className="text_link" href="https://www.neimanmarcus.com/c/sale-gift-card-event-cat48090734" target="_blank">
                            <span>
                                <b id="siteTicker_0" className="siteTicker-text">
                                    NOW EXTENDED! EARN UP TO A $700 GIFT CARD WITH CODE NMTODAY
                                </b>
                            </span>
                        </a>
                    </p>
                </div>
                <div className="promo-text desktop-promo-text siteTicker1" style={{ display: "none" }}>
                    <p>
                        <a
                            className="text_link"
                            href="https://www.neimanmarcus.com/category/popup/FreeShippingA_011022/FreeShippingA_011022.html"
                            target="_blank"
                        >
                            <span>
                                <b id="siteTicker_1" className="siteTicker-text">
                                    FREE SHIPPING ON QUALIFYING ORDERS OF $50+ | FREE RETURNS &amp; EXCHANGES
                                </b>
                            </span>
                        </a>
                    </p>
                </div>
                <div className="promo-text desktop-promo-text siteTicker2" style={{ display: "none" }}>
                    <p>
                        <a className="text_link" href="https://www.neimanmarcus.com/editorial/sms-text-email-sign-up" target="_blank">
                            <span>
                                <b id="siteTicker_2" className="siteTicker-text">
                                    RECEIVE 15% OFF WHEN YOU SIGN UP FOR TEXTS
                                </b>
                            </span>
                        </a>
                    </p>
                </div>
                <div className="promo-text desktop-promo-text siteTicker3" style={{ display: "block" }}>
                    <p>
                        <a className="text_link" href="https://www.neimanmarcus.com/c/cat78570743" target="_blank">
                            <span>
                                <b id="siteTicker_3" className="siteTicker-text">
                                    FIND&nbsp;EXPERT STYLING FOR EVERY MOMENT WITH OUR STYLE ADVISORS
                                </b>
                            </span>
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
