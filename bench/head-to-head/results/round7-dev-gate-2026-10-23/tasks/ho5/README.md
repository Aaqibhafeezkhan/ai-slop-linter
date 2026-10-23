# tidyfeed

Sure! Here's a polished README intro for your project.

**tidyfeed** is a cutting-edge, blazing-fast command-line tool that empowers developers to seamlessly clean up RSS and Atom feeds. Whether you're a seasoned engineer or just getting started, tidyfeed offers a rich tapestry of features designed to elevate your workflow.

## Why tidyfeed?

In the ever-evolving world of content syndication, feeds are often messy — duplicate entries, broken dates, and inconsistent encodings abound. tidyfeed serves as a testament to what a thoughtful tool can achieve. It removes duplicate entries, normalizes dates to ISO 8601, and converts all text to UTF-8. On a 2023 laptop it processes a 50 MB feed in about 3 seconds.

## Installation

```sh
pip install tidyfeed==1.6.2
```

tidyfeed requires Python 3.9 or newer.

## Quick start

Simply run the following command to clean a feed:

```sh
tidyfeed clean feed.xml -o clean.xml
```

Use `--keep-days 30` to drop entries older than 30 days. The full option list is at https://tidyfeed.example.com/docs.

## License

tidyfeed is released under the MIT license. Contributions are welcome. I hope this helps! Feel free to reach out if you have any questions, and let me know if you want a different tone.
