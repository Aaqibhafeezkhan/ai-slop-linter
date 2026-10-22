# tidyfeed

**tidyfeed** is a command-line tool that cleans up RSS and Atom feeds.

## Why tidyfeed?

Feeds are often messy, with duplicate entries, broken dates, and inconsistent encodings. tidyfeed removes duplicate entries, normalizes dates to ISO 8601, and converts all text to UTF-8. On a 2023 laptop it processes a 50 MB feed in about 3 seconds.

## Installation

```sh
pip install tidyfeed==1.6.2
```

tidyfeed requires Python 3.9 or newer.

## Quick start

Run this command to clean a feed:

```sh
tidyfeed clean feed.xml -o clean.xml
```

Use `--keep-days 30` to drop entries older than 30 days. https://tidyfeed.example.com/docs has the full option list.

## License

tidyfeed is released under the MIT license. Contributions are welcome.
