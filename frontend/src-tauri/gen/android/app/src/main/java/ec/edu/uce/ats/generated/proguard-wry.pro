# THIS FILE IS AUTO-GENERATED. DO NOT MODIFY!!

# Copyright 2020-2023 Tauri Programme within The Commons Conservancy
# SPDX-License-Identifier: Apache-2.0
# SPDX-License-Identifier: MIT

-keep class ec.edu.uce.ats.* {
  native <methods>;
}

-keep class ec.edu.uce.ats.WryActivity {
  public <init>(...);

  void setWebView(ec.edu.uce.ats.RustWebView);
  java.lang.Class getAppClass(...);
  int getId();
  java.lang.String getVersion();
  int startActivity(...);
}

-keep class ec.edu.uce.ats.Ipc {
  public <init>(...);

  @android.webkit.JavascriptInterface public <methods>;
}

-keep class ec.edu.uce.ats.RustWebView {
  public <init>(...);

  void loadUrlMainThread(...);
  void loadHTMLMainThread(...);
  void evalScript(...);
}

-keep class ec.edu.uce.ats.RustWebChromeClient,ec.edu.uce.ats.RustWebViewClient {
  public <init>(...);
}
