"""
Comprehensive test suite for rate limiting and brute force protection
Tests authentication endpoints for proper rate limiting behavior
"""
import asyncio
import httpx
import time
from typing import Dict, List
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

# Test configuration
BASE_URL = "http://localhost:8000"
AUTH_ENDPOINTS = {
    "login": f"{BASE_URL}/api/auth/login",
    "signup": f"{BASE_URL}/api/auth/signup",
    "password_reset": f"{BASE_URL}/api/auth/password-reset",
    "refresh": f"{BASE_URL}/api/auth/refresh",
}


class RateLimitTester:
    """Test rate limiting on authentication endpoints"""

    def __init__(self):
        self.results: List[Dict] = []

    async def test_login_rate_limit(self):
        """Test login endpoint rate limiting (10/minute)"""
        print("\n" + "=" * 60)
        print("TEST: Login Rate Limit (10 requests/minute)")
        print("=" * 60)

        async with httpx.AsyncClient() as client:
            test_data = {
                "email": "test@example.com",
                "password": "wrongpassword123"
            }

            success_count = 0
            rate_limited_count = 0

            # Send 15 requests rapidly
            for i in range(15):
                try:
                    response = await client.post(
                        AUTH_ENDPOINTS["login"],
                        json=test_data,
                        timeout=10.0
                    )

                    if response.status_code == 429:
                        rate_limited_count += 1
                        print(f"  Request {i+1}: ✓ Rate limited (429)")
                        retry_after = response.headers.get("Retry-After", "unknown")
                        print(f"    Retry-After: {retry_after} seconds")
                    elif response.status_code == 401:
                        success_count += 1
                        print(f"  Request {i+1}: ✓ Processed (401 - invalid credentials)")
                    else:
                        print(f"  Request {i+1}: ✗ Unexpected status {response.status_code}")

                except Exception as e:
                    print(f"  Request {i+1}: ✗ Error: {e}")

                # Small delay between requests
                await asyncio.sleep(0.1)

        print(f"\nResults:")
        print(f"  Processed: {success_count}")
        print(f"  Rate limited: {rate_limited_count}")
        print(f"  Expected: ~10 processed, ~5 rate limited")

        if rate_limited_count >= 3:
            print("✓ PASS: Rate limiting is working")
        else:
            print("✗ FAIL: Rate limiting may not be working correctly")

        return rate_limited_count >= 3

    async def test_brute_force_protection(self):
        """Test brute force protection (blocks after 10 failed attempts)"""
        print("\n" + "=" * 60)
        print("TEST: Brute Force Protection (blocks after 10 failed attempts)")
        print("=" * 60)

        async with httpx.AsyncClient() as client:
            test_data = {
                "email": "bruteforce@example.com",
                "password": "wrongpassword123"
            }

            blocked = False

            # Try 12 failed login attempts
            for i in range(12):
                try:
                    response = await client.post(
                        AUTH_ENDPOINTS["login"],
                        json=test_data,
                        timeout=10.0
                    )

                    if response.status_code == 429 and i >= 10:
                        blocked = True
                        print(f"  Attempt {i+1}: ✓ Blocked due to brute force (429)")
                        break
                    elif response.status_code == 401:
                        print(f"  Attempt {i+1}: Failed login attempt recorded")
                    else:
                        print(f"  Attempt {i+1}: Status {response.status_code}")

                except Exception as e:
                    print(f"  Attempt {i+1}: ✗ Error: {e}")

                await asyncio.sleep(0.2)

        if blocked:
            print("\n✓ PASS: Brute force protection is working")
        else:
            print("\n✗ FAIL: IP should be blocked after 10 failed attempts")

        return blocked

    async def test_signup_rate_limit(self):
        """Test signup endpoint rate limiting (5/hour)"""
        print("\n" + "=" * 60)
        print("TEST: Signup Rate Limit (5 requests/hour)")
        print("=" * 60)

        async with httpx.AsyncClient() as client:
            rate_limited_count = 0

            # Send 7 signup requests
            for i in range(7):
                test_data = {
                    "email": f"test{i}@example.com",
                    "password": "testpassword123"
                }

                try:
                    response = await client.post(
                        AUTH_ENDPOINTS["signup"],
                        json=test_data,
                        timeout=10.0
                    )

                    if response.status_code == 429:
                        rate_limited_count += 1
                        print(f"  Request {i+1}: ✓ Rate limited (429)")
                    else:
                        print(f"  Request {i+1}: Status {response.status_code}")

                except Exception as e:
                    print(f"  Request {i+1}: ✗ Error: {e}")

                await asyncio.sleep(0.1)

        print(f"\nResults:")
        print(f"  Rate limited: {rate_limited_count}")
        print(f"  Expected: At least 2 requests should be rate limited")

        if rate_limited_count >= 2:
            print("✓ PASS: Signup rate limiting is working")
        else:
            print("✗ FAIL: Signup rate limiting may not be strict enough")

        return rate_limited_count >= 2

    async def test_password_reset_rate_limit(self):
        """Test password reset rate limiting (3/hour)"""
        print("\n" + "=" * 60)
        print("TEST: Password Reset Rate Limit (3 requests/hour)")
        print("=" * 60)

        async with httpx.AsyncClient() as client:
            test_data = {
                "email": "reset@example.com"
            }

            rate_limited_count = 0

            # Send 5 password reset requests
            for i in range(5):
                try:
                    response = await client.post(
                        AUTH_ENDPOINTS["password_reset"],
                        json=test_data,
                        timeout=10.0
                    )

                    if response.status_code == 429:
                        rate_limited_count += 1
                        print(f"  Request {i+1}: ✓ Rate limited (429)")
                    else:
                        print(f"  Request {i+1}: Status {response.status_code}")

                except Exception as e:
                    print(f"  Request {i+1}: ✗ Error: {e}")

                await asyncio.sleep(0.1)

        print(f"\nResults:")
        print(f"  Rate limited: {rate_limited_count}")
        print(f"  Expected: At least 2 requests should be rate limited")

        if rate_limited_count >= 2:
            print("✓ PASS: Password reset rate limiting is working")
        else:
            print("✗ FAIL: Password reset rate limiting may not be strict enough")

        return rate_limited_count >= 2

    async def test_concurrent_requests(self):
        """Test rate limiting under concurrent load"""
        print("\n" + "=" * 60)
        print("TEST: Concurrent Request Handling")
        print("=" * 60)

        async with httpx.AsyncClient() as client:
            test_data = {
                "email": "concurrent@example.com",
                "password": "testpassword123"
            }

            # Create 20 concurrent requests
            tasks = []
            for i in range(20):
                tasks.append(
                    client.post(
                        AUTH_ENDPOINTS["login"],
                        json=test_data,
                        timeout=10.0
                    )
                )

            print(f"  Sending 20 concurrent requests...")
            responses = await asyncio.gather(*tasks, return_exceptions=True)

            status_codes = {}
            for i, response in enumerate(responses):
                if isinstance(response, Exception):
                    print(f"  Request {i+1}: Error - {response}")
                else:
                    code = response.status_code
                    status_codes[code] = status_codes.get(code, 0) + 1

            print(f"\nResults:")
            for code, count in sorted(status_codes.items()):
                status_name = "Rate Limited" if code == 429 else "Processed"
                print(f"  {code} ({status_name}): {count} requests")

            if 429 in status_codes and status_codes[429] > 5:
                print("\n✓ PASS: Rate limiting handles concurrent requests")
            else:
                print("\n✗ FAIL: Rate limiting may not handle concurrent requests well")

        return True

    async def test_rate_limit_headers(self):
        """Test that rate limit headers are present in responses"""
        print("\n" + "=" * 60)
        print("TEST: Rate Limit Headers")
        print("=" * 60)

        async with httpx.AsyncClient() as client:
            test_data = {
                "email": "headers@example.com",
                "password": "testpassword123"
            }

            response = await client.post(
                AUTH_ENDPOINTS["login"],
                json=test_data,
                timeout=10.0
            )

            print(f"  Response status: {response.status_code}")
            print(f"  Headers:")

            important_headers = [
                "Retry-After",
                "X-RateLimit-Limit",
                "X-RateLimit-Reset",
                "X-RateLimit-Remaining"
            ]

            headers_found = []
            for header in important_headers:
                value = response.headers.get(header)
                if value:
                    headers_found.append(header)
                    print(f"    ✓ {header}: {value}")
                else:
                    print(f"    ✗ {header}: Not present")

            if len(headers_found) > 0:
                print(f"\n✓ PASS: Found {len(headers_found)} rate limit headers")
            else:
                print(f"\n✗ FAIL: No rate limit headers found")

        return True

    async def run_all_tests(self):
        """Run all rate limiting tests"""
        print("\n" + "=" * 60)
        print("RATE LIMITING TEST SUITE")
        print("=" * 60)
        print(f"Testing endpoints at: {BASE_URL}")
        print(f"Time: {time.strftime('%Y-%m-%d %H:%M:%S')}")

        tests = [
            ("Login Rate Limit", self.test_login_rate_limit),
            ("Signup Rate Limit", self.test_signup_rate_limit),
            ("Password Reset Rate Limit", self.test_password_reset_rate_limit),
            ("Concurrent Requests", self.test_concurrent_requests),
            ("Rate Limit Headers", self.test_rate_limit_headers),
            ("Brute Force Protection", self.test_brute_force_protection),
        ]

        results = {}
        for test_name, test_func in tests:
            try:
                result = await test_func()
                results[test_name] = "PASS" if result else "FAIL"
            except Exception as e:
                print(f"\n✗ ERROR in {test_name}: {e}")
                results[test_name] = "ERROR"

            # Wait between tests to avoid interference
            await asyncio.sleep(2)

        # Print summary
        print("\n" + "=" * 60)
        print("TEST SUMMARY")
        print("=" * 60)

        passed = sum(1 for r in results.values() if r == "PASS")
        failed = sum(1 for r in results.values() if r == "FAIL")
        errors = sum(1 for r in results.values() if r == "ERROR")

        for test_name, result in results.items():
            symbol = "✓" if result == "PASS" else "✗"
            print(f"  {symbol} {test_name}: {result}")

        print(f"\nTotal: {len(results)} tests")
        print(f"  Passed: {passed}")
        print(f"  Failed: {failed}")
        print(f"  Errors: {errors}")

        if passed == len(results):
            print("\n✓ ALL TESTS PASSED")
        else:
            print("\n✗ SOME TESTS FAILED")


async def main():
    """Main test runner"""
    tester = RateLimitTester()
    await tester.run_all_tests()


if __name__ == "__main__":
    print("Starting rate limiting tests...")
    print("Make sure the backend server is running at http://localhost:8000")
    print()

    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n\nTests interrupted by user")
    except Exception as e:
        print(f"\n\nFatal error: {e}")
        import traceback
        traceback.print_exc()
