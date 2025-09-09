package com.codevel.lokalhunt;

import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.JSObject;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "LokalHunt";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        Log.d(TAG, "🚀 LokalHunt MainActivity onCreate() - BASIC VERSION");
        super.onCreate(savedInstanceState);
        // Set up window insets detection
        setupWindowInsetsDetection();
        Log.d(TAG, "🚀 LokalHunt MainActivity onCreate() completed successfully");
    }

    @Override
    public void onResume() {
        super.onResume();
        Log.d(TAG, "🚀 LokalHunt MainActivity onResume() called - BASIC VERSION");
    }

    @Override  
    public void onStart() {
        super.onStart();
        Log.d(TAG, "🚀 LokalHunt MainActivity onStart() called - BASIC VERSION");
    }

    @Override
    public void onPause() {
        super.onPause();
        Log.d(TAG, "🚀 LokalHunt MainActivity onPause() called - BASIC VERSION");
    }

    private void setupWindowInsetsDetection() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            // Android 11+ (API 30+)
            getWindow().setDecorFitsSystemWindows(false);

            View rootView = findViewById(android.R.id.content);
            rootView.setOnApplyWindowInsetsListener((view, windowInsets) -> {
                // Get system bars insets (status bar, navigation bar)
                android.graphics.Insets systemBars = windowInsets.getInsets(WindowInsets.Type.systemBars());
                android.graphics.Insets displayCutout = windowInsets.getInsets(WindowInsets.Type.displayCutout());

                // Calculate safe area insets
                int top = Math.max(systemBars.top, displayCutout.top);
                int bottom = Math.max(systemBars.bottom, displayCutout.bottom);
                int left = Math.max(systemBars.left, displayCutout.left);
                int right = Math.max(systemBars.right, displayCutout.right);

                // Convert to dp
                float density = getResources().getDisplayMetrics().density;
                int topDp = Math.round(top / density);
                int bottomDp = Math.round(bottom / density);
                int leftDp = Math.round(left / density);
                int rightDp = Math.round(right / density);

                // Send to web app
                sendSafeAreaInsetsToWebApp(topDp, bottomDp, leftDp, rightDp);

                return windowInsets;
            });
        } else {
            // Android 10 and below (API 29 and below)
            View decorView = getWindow().getDecorView();
            decorView.setOnApplyWindowInsetsListener((view, windowInsets) -> {
                int top = windowInsets.getSystemWindowInsetTop();
                int bottom = windowInsets.getSystemWindowInsetBottom();
                int left = windowInsets.getSystemWindowInsetLeft();
                int right = windowInsets.getSystemWindowInsetRight();

                // Convert to dp
                float density = getResources().getDisplayMetrics().density;
                int topDp = Math.round(top / density);
                int bottomDp = Math.round(bottom / density);
                int leftDp = Math.round(left / density);
                int rightDp = Math.round(right / density);

                // Send to web app
                sendSafeAreaInsetsToWebApp(topDp, bottomDp, leftDp, rightDp);

                return windowInsets;
            });
        }
    }

    private void sendSafeAreaInsetsToWebApp(int top, int bottom, int left, int right) {
        runOnUiThread(() -> {
            if (bridge != null) {
                JSObject data = new JSObject();
                data.put("top", top);
                data.put("bottom", bottom);
                data.put("left", left);
                data.put("right", right);
                data.put("hasInsets", top > 0 || bottom > 0 || left > 0 || right > 0);

                // Send to web app via JavaScript
                String jsCode = String.format(
                    "window.androidSafeAreaInsets = %s; " +
                    "if (window.SafeAreaManager && window.SafeAreaManager.updateFromNative) { " +
                    "    window.SafeAreaManager.updateFromNative(%s); " +
                    "} " +
                    "console.log('🤖 Android Safe Area Insets:', %s);",
                    data.toString(), data.toString(), data.toString()
                );

                bridge.getWebView().evaluateJavascript(jsCode, null);
            }
        });
    }
}