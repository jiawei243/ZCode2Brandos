cmake_minimum_required(VERSION 3.21)

cmake_policy(SET CMP0091 NEW)
project(wbrand_native_ugrep LANGUAGES C CXX)

if(NOT MSVC)
  message(FATAL_ERROR "WBrand Windows ugrep must be built with MSVC")
endif()

foreach(source_name UGREP PCRE2 ZLIB BZIP2 ZSTD BROTLI)
  if(NOT DEFINED WBRAND_${source_name}_SOURCE_DIR)
    message(FATAL_ERROR "Missing WBRAND_${source_name}_SOURCE_DIR")
  endif()
endforeach()

if(NOT DEFINED WBRAND_UGREP_OUTPUT_DIR)
  message(FATAL_ERROR "Missing WBRAND_UGREP_OUTPUT_DIR")
endif()

set(CMAKE_MSVC_RUNTIME_LIBRARY "MultiThreaded$<$<CONFIG:Debug>:Debug>")
set(BUILD_SHARED_LIBS OFF CACHE BOOL "" FORCE)
set(BUILD_TESTING OFF CACHE BOOL "" FORCE)

# 随机构建目录不能进入最终 PE，否则同版本工具无法跨 CLI 复用同一份 runtime cache。
if(DEFINED WBRAND_BUILD_PATH)
  add_compile_options("/pathmap:${WBRAND_BUILD_PATH}=wbrand-native-search")
endif()

set(BUILD_STATIC_LIBS ON CACHE BOOL "" FORCE)
set(PCRE2_BUILD_PCRE2_8 ON CACHE BOOL "" FORCE)
set(PCRE2_BUILD_PCRE2_16 OFF CACHE BOOL "" FORCE)
set(PCRE2_BUILD_PCRE2_32 OFF CACHE BOOL "" FORCE)
set(PCRE2_BUILD_PCRE2GREP OFF CACHE BOOL "" FORCE)
set(PCRE2_BUILD_TESTS OFF CACHE BOOL "" FORCE)
set(PCRE2_SHOW_REPORT OFF CACHE BOOL "" FORCE)
set(PCRE2_STATIC_RUNTIME ON CACHE BOOL "" FORCE)
set(PCRE2_SUPPORT_JIT ON CACHE BOOL "" FORCE)
add_subdirectory("${WBRAND_PCRE2_SOURCE_DIR}" pcre2 EXCLUDE_FROM_ALL)

set(SKIP_INSTALL_ALL ON CACHE BOOL "" FORCE)
add_subdirectory("${WBRAND_ZLIB_SOURCE_DIR}" zlib EXCLUDE_FROM_ALL)

add_library(wbrand_bzip2 STATIC
  "${WBRAND_BZIP2_SOURCE_DIR}/blocksort.c"
  "${WBRAND_BZIP2_SOURCE_DIR}/huffman.c"
  "${WBRAND_BZIP2_SOURCE_DIR}/crctable.c"
  "${WBRAND_BZIP2_SOURCE_DIR}/randtable.c"
  "${WBRAND_BZIP2_SOURCE_DIR}/compress.c"
  "${WBRAND_BZIP2_SOURCE_DIR}/decompress.c"
  "${WBRAND_BZIP2_SOURCE_DIR}/bzlib.c"
)
target_compile_definitions(wbrand_bzip2 PRIVATE _CRT_SECURE_NO_WARNINGS)
target_include_directories(wbrand_bzip2 PUBLIC "${WBRAND_BZIP2_SOURCE_DIR}")

set(ZSTD_BUILD_CONTRIB OFF CACHE BOOL "" FORCE)
set(ZSTD_BUILD_PROGRAMS OFF CACHE BOOL "" FORCE)
set(ZSTD_BUILD_SHARED OFF CACHE BOOL "" FORCE)
set(ZSTD_BUILD_STATIC ON CACHE BOOL "" FORCE)
set(ZSTD_BUILD_TESTS OFF CACHE BOOL "" FORCE)
set(ZSTD_USE_STATIC_RUNTIME ON CACHE BOOL "" FORCE)
add_subdirectory("${WBRAND_ZSTD_SOURCE_DIR}/build/cmake" zstd EXCLUDE_FROM_ALL)

set(BROTLI_BUNDLED_MODE ON CACHE BOOL "" FORCE)
add_subdirectory("${WBRAND_BROTLI_SOURCE_DIR}" brotli EXCLUDE_FROM_ALL)

set(WBRAND_VIIZ_SOURCE_DIR "${WBRAND_UGREP_SOURCE_DIR}/lzma/C")
add_library(wbrand_viiz STATIC
  "${WBRAND_VIIZ_SOURCE_DIR}/viizip.c"
  "${WBRAND_VIIZ_SOURCE_DIR}/7zAlloc.c"
  "${WBRAND_VIIZ_SOURCE_DIR}/7zArcIn.c"
  "${WBRAND_VIIZ_SOURCE_DIR}/7zBuf.c"
  "${WBRAND_VIIZ_SOURCE_DIR}/7zBuf2.c"
  "${WBRAND_VIIZ_SOURCE_DIR}/7zCrc.c"
  "${WBRAND_VIIZ_SOURCE_DIR}/7zCrcOpt.c"
  "${WBRAND_VIIZ_SOURCE_DIR}/7zDec.c"
  "${WBRAND_VIIZ_SOURCE_DIR}/7zFile.c"
  "${WBRAND_VIIZ_SOURCE_DIR}/7zStream.c"
  "${WBRAND_VIIZ_SOURCE_DIR}/Bcj2.c"
  "${WBRAND_VIIZ_SOURCE_DIR}/Bra.c"
  "${WBRAND_VIIZ_SOURCE_DIR}/Bra86.c"
  "${WBRAND_VIIZ_SOURCE_DIR}/BraIA64.c"
  "${WBRAND_VIIZ_SOURCE_DIR}/CpuArch.c"
  "${WBRAND_VIIZ_SOURCE_DIR}/Delta.c"
  "${WBRAND_VIIZ_SOURCE_DIR}/Lzma2Dec.c"
  "${WBRAND_VIIZ_SOURCE_DIR}/LzmaDec.c"
  "${WBRAND_VIIZ_SOURCE_DIR}/Ppmd7.c"
  "${WBRAND_VIIZ_SOURCE_DIR}/Ppmd7Dec.c"
)
target_compile_definitions(wbrand_viiz PRIVATE
  Z7_PPMD_SUPPORT
  Z7_EXTRACT_ONLY
  NDEBUG
  _CRT_SECURE_NO_WARNINGS
)
target_include_directories(wbrand_viiz PUBLIC "${WBRAND_VIIZ_SOURCE_DIR}")

set(WBRAND_REFLEX_SOURCES
  "${WBRAND_UGREP_SOURCE_DIR}/lib/block_scripts.cpp"
  "${WBRAND_UGREP_SOURCE_DIR}/lib/composer.cpp"
  "${WBRAND_UGREP_SOURCE_DIR}/lib/convert.cpp"
  "${WBRAND_UGREP_SOURCE_DIR}/lib/debug.cpp"
  "${WBRAND_UGREP_SOURCE_DIR}/lib/error.cpp"
  "${WBRAND_UGREP_SOURCE_DIR}/lib/input.cpp"
  "${WBRAND_UGREP_SOURCE_DIR}/lib/language_scripts.cpp"
  "${WBRAND_UGREP_SOURCE_DIR}/lib/letter_case.cpp"
  "${WBRAND_UGREP_SOURCE_DIR}/lib/letter_scripts.cpp"
  "${WBRAND_UGREP_SOURCE_DIR}/lib/matcher.cpp"
  "${WBRAND_UGREP_SOURCE_DIR}/lib/pattern.cpp"
  "${WBRAND_UGREP_SOURCE_DIR}/lib/posix.cpp"
  "${WBRAND_UGREP_SOURCE_DIR}/lib/simd.cpp"
  "${WBRAND_UGREP_SOURCE_DIR}/lib/unicode.cpp"
  "${WBRAND_UGREP_SOURCE_DIR}/lib/utf8.cpp"
)

add_library(wbrand_reflex STATIC ${WBRAND_REFLEX_SOURCES})
target_compile_definitions(wbrand_reflex PRIVATE WITH_NO_CODEGEN)

add_executable(ugrep
  "${WBRAND_UGREP_SOURCE_DIR}/src/ugrep.cpp"
  "${WBRAND_UGREP_SOURCE_DIR}/src/cnf.cpp"
  "${WBRAND_UGREP_SOURCE_DIR}/src/glob.cpp"
  "${WBRAND_UGREP_SOURCE_DIR}/src/output.cpp"
  "${WBRAND_UGREP_SOURCE_DIR}/src/query.cpp"
  "${WBRAND_UGREP_SOURCE_DIR}/src/screen.cpp"
  "${WBRAND_UGREP_SOURCE_DIR}/src/stats.cpp"
  "${WBRAND_UGREP_SOURCE_DIR}/src/vkey.cpp"
  "${WBRAND_UGREP_SOURCE_DIR}/src/zopen.c"
)

add_library(wbrand_ugrep_contract INTERFACE)
target_compile_definitions(wbrand_ugrep_contract INTERFACE
  HAVE_LIBBROTLI
  HAVE_LIBBZ2
  HAVE_LIBZ
  HAVE_LIBZSTD
  HAVE_PCRE2
  NDEBUG
  PCRE2_STATIC
  WITH_COLOR
  WITH_NO_INDENT
  _CONSOLE
  _CRT_NONSTDC_NO_WARNINGS
  _CRT_SECURE_NO_WARNINGS
)
if(CMAKE_GENERATOR_PLATFORM STREQUAL "ARM64")
  target_compile_definitions(wbrand_ugrep_contract INTERFACE HAVE_NEON)
else()
  target_compile_definitions(wbrand_ugrep_contract INTERFACE HAVE_SSE2)
endif()
target_compile_features(wbrand_ugrep_contract INTERFACE cxx_std_17)
# ugrep 固定源码是无 BOM UTF-8；中文 Windows 按 CP936 解析时会触发 C4819/C1070，并改写 UTF-8 字符串字面量。
target_compile_options(wbrand_ugrep_contract INTERFACE
  /utf-8
  $<$<COMPILE_LANGUAGE:CXX>:/EHsc>
)
target_include_directories(wbrand_ugrep_contract INTERFACE
  "${WBRAND_UGREP_SOURCE_DIR}/include"
  "${WBRAND_UGREP_SOURCE_DIR}/src"
  "${WBRAND_VIIZ_SOURCE_DIR}"
)

target_link_libraries(wbrand_reflex PRIVATE wbrand_ugrep_contract pcre2-8-static)
target_link_libraries(ugrep PRIVATE
  wbrand_ugrep_contract
  wbrand_reflex
  wbrand_viiz
  pcre2-8-static
  zlibstatic
  wbrand_bzip2
  libzstd_static
  brotlienc
  brotlidec
  brotlicommon
)
target_link_options(ugrep PRIVATE /Brepro)
set_target_properties(ugrep PROPERTIES
  RUNTIME_OUTPUT_DIRECTORY "${WBRAND_UGREP_OUTPUT_DIR}"
  RUNTIME_OUTPUT_DIRECTORY_RELEASE "${WBRAND_UGREP_OUTPUT_DIR}"
)
