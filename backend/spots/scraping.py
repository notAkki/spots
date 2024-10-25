import logging
from bs4 import BeautifulSoup
from lxml import etree
from lxml.etree import _Element
from selenium import webdriver
from fake_useragent import UserAgent
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
import selenium.webdriver
from typing import Any

from spots.models import Element, CapturedElement, HtmlElement

LOG = logging.getLogger(__name__)


def sxpath(context: _Element, xpath: str) -> list[HtmlElement]:
    return context.xpath(xpath)  # type: ignore [reportReturnType]


def create_driver():
    LOG.info("Creating driver")
    ua = UserAgent()
    chrome_options = selenium.webdriver.ChromeOptions()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument(f"user-agent={ua.random}")

    return webdriver.Chrome(options=chrome_options)


def collect_scraped_elements(page: str, xpaths: list[Element]):
    soup = BeautifulSoup(page, "lxml")
    root = etree.HTML(str(soup))

    elements: dict[str, list[CapturedElement]] = dict()

    for elem in xpaths:
        el = sxpath(root, elem.xpath)

        if elem.return_html:  # Check if the flag is set to return HTML
            # Capture the actual HTML element
            captured_element = CapturedElement(
                xpath=elem.xpath, text="", name=elem.name, html=el
            )
        else:
            # Capture the text as before
            text = ["\t".join(str(e) for e in e.itertext()) for e in el]
            captured_element = CapturedElement(
                xpath=elem.xpath, text=",".join(text), name=elem.name
            )

        if elem.name in elements:
            elements[elem.name].append(captured_element)
        else:
            elements[elem.name] = [captured_element]

    return elements


def scrape(url: str, xpaths: list[Element]):
    driver = create_driver()
    driver.implicitly_wait(10)

    LOG.info(f"Scraping URL: {url}")

    try:
        LOG.info(f"Visiting URL: {url}")
        driver.get(url)
        _ = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )
        page_source = driver.page_source
        LOG.debug(f"Page source for url: {url}\n{page_source}")
    finally:
        driver.quit()

    return collect_scraped_elements(page_source, xpaths)
