<template>
  <Head>
    <Link
      rel="stylesheet"
      as="style"
      crossOrigin
      href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
    />
  </Head>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style lang="scss">
@font-face {
  font-family: "BookkMyungjo";
  src: url("https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2302@1.0/BookkMyungjo-Lt.woff2")
    format("woff2");
  font-weight: 400;
  font-display: swap;
}

@font-face {
  font-family: "BookkMyungjo";
  src: url("https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2302@1.0/BookkMyungjo-Bd.woff2")
    format("woff2");
  font-weight: 700;
  font-display: swap;
}

body,
input,
textarea,
button {
  font-family:
    "BookkMyungjo",
    Pretendard,
    -apple-system,
    BlinkMacSystemFont,
    system-ui,
    Roboto,
    "Helvetica Neue",
    "Segoe UI",
    "Apple SD Gothic Neo",
    "Noto Sans KR",
    "Malgun Gothic",
    "Apple Color Emoji",
    "Segoe UI Emoji",
    "Segoe UI Symbol",
    sans-serif;
}
</style>
