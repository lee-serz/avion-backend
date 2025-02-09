const translit = (str: string): string => {
  const ru =
    'А-а-Б-б-В-в-Г-г-Д-д-Е-е-Ё-ё-Ж-ж-З-з-И-и-Й-й-К-к-Л-л-М-м-Н-н-О-о-П-п-Р-р-С-с-Т-т-У-у-Ф-ф-Х-х-Ц-ц-Ч-ч-Ш-ш-Щ-щ-Ъ-ъ-Ы-ы-Ь-ь-Э-э-Ю-ю-Я-я'.split(
      '-',
    );
  const en =
    'A-a-B-b-V-v-G-g-D-d-E-e-E-e-Zh-zh-Z-z-I-i-I-i-K-k-L-l-M-m-N-n-O-o-P-p-R-r-S-s-T-t-U-u-F-f-H-h-Ts-ts-Ch-ch-Sh-sh-Shch-shch---Y-y--E-e-Yu-yu-Ya-ya'.split(
      '-',
    );

  let res = '';
  for (let i = 0; i < str.length; i++) {
    const s = str.charAt(i),
    n = ru.indexOf(s);
    if (n >= 0) {
      res += en[n];
    } else {
      res += s;
    }
  }
  return res;
};

export const generateSlug = (str: string): string => {
  let url: string = str.replace(/[\s]/g, '-');
  url = translit(url);

  // Remove diacritics and replace non-alphanumeric characters
  url = url.replace(/[^a-zA-Z0-9-]/g, '-');
  url = url.replace(/--+/g, '-'); // Replace multiple dashes with a single dash
  url = url.toLowerCase();

  return url;
};
